import { getDB } from '../db';


function parseFilter(filter: Record<string, any>, tableColumns: string[]) {
  let conditions: string[] = [];
  let params: any[] = [];
  if (!filter || Object.keys(filter).length === 0) return { where: '1=1', params: [] };
  if (filter.$or && Array.isArray(filter.$or)) {
    const subConds: string[] = [];
    for (const subFilter of filter.$or) {
      const res = parseFilter(subFilter, tableColumns);
      if (res.where !== '1=1') { subConds.push(`(${res.where})`); params.push(...res.params); }
    }
    if (subConds.length > 0) conditions.push(`(${subConds.join(' OR ')})`);
  }
  for (const key of Object.keys(filter)) {
    if (key === '$or') continue;
    const val = filter[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      for (const op of Object.keys(val)) {
        if (op === '$regex') {
          let pattern = val[op];
          if (pattern instanceof RegExp) pattern = pattern.source;
          let cleanPattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
          conditions.push(`"${key}" LIKE ?`); params.push(`%${cleanPattern}%`);
        } else if (op === '$gte') { conditions.push(`"${key}" >= ?`); params.push(val[op]); }
        else if (op === '$lte') { conditions.push(`"${key}" <= ?`); params.push(val[op]); }
        else if (op === '$gt') { conditions.push(`"${key}" > ?`); params.push(val[op]); }
        else if (op === '$lt') { conditions.push(`"${key}" < ?`); params.push(val[op]); }
        else if (op === '$ne') { conditions.push(`"${key}" != ?`); params.push(val[op]); }
        else if (op === '$in') {
          if (Array.isArray(val[op]) && val[op].length > 0) {
            const placeholders = val[op].map(() => '?').join(',');
            conditions.push(`"${key}" IN (${placeholders})`); params.push(...val[op]);
          } else { conditions.push('1=0'); }
        }
      }
    } else {
      conditions.push(`"${key}" = ?`);
      params.push(val instanceof Date ? val.toISOString() : val);
    }
  }
  if (conditions.length === 0) return { where: '1=1', params: [] };
  return { where: conditions.join(' AND '), params };
}

async function executePopulate(docs: any[], populateOptions: any[]) {
  if (!docs || docs.length === 0 || populateOptions.length === 0) return;
  for (const option of populateOptions) {
    const { path, select } = option;
    if (path.includes('.')) {
      const [parentPath, childPath] = path.split('.');
      const childIds = new Set<string>();
      for (const doc of docs) {
        const parentVal = doc[parentPath];
        if (Array.isArray(parentVal)) {
          for (const item of parentVal) { if (item && item[childPath]) childIds.add(item[childPath]); }
        } else if (parentVal && parentVal[childPath]) { childIds.add(parentVal[childPath]); }
      }
      if (childIds.size === 0) continue;
      const { Product } = await import('./Product');
      const childDocs = await Product.find({ _id: { $in: Array.from(childIds) } });
      const childMap = new Map(childDocs.map((d: any) => [d._id.toString(), d]));
      for (const doc of docs) {
        const parentVal = doc[parentPath];
        if (Array.isArray(parentVal)) {
          for (const item of parentVal) {
            if (item && item[childPath]) item[childPath] = childMap.get(item[childPath].toString()) || null;
          }
        } else if (parentVal && parentVal[childPath]) {
          parentVal[childPath] = childMap.get(parentVal[childPath].toString()) || null;
        }
      }
    } else {
      const ids = new Set<string>();
      for (const doc of docs) { if (doc[path]) ids.add(doc[path]); }
      if (ids.size === 0) continue;
      let refModel: any;
      if (path === 'category') { const { Category } = await import('./Category'); refModel = Category; }
      else if (path === 'user') { const { User } = await import('./User'); refModel = User; }
      else if (path === 'product') { const { Product } = await import('./Product'); refModel = Product; }
      if (!refModel) continue;
      const refDocs = await refModel.find({ _id: { $in: Array.from(ids) } });
      let selectFields: string[] = [];
      if (select) selectFields = select.split(/\s+/).filter(Boolean);
      const refMap = new Map<string, any>();
      for (const rDoc of refDocs) {
        let cleanDoc = { ...rDoc };
        if (selectFields.length > 0) {
          const kept: any = { _id: rDoc._id };
          for (const field of selectFields) {
            if (field.startsWith('-')) delete cleanDoc[field.substring(1)];
            else kept[field] = rDoc[field];
          }
          if (!select.includes('-')) cleanDoc = kept;
        }
        refMap.set(rDoc._id.toString(), cleanDoc);
      }
      for (const doc of docs) {
        if (doc[path]) doc[path] = refMap.get(doc[path].toString()) || null;
      }
    }
  }
}

class QueryBuilder {
  model: any; filter: any; _sort: any = null; _skip: number | null = null;
  _limit: number | null = null; _select: string[] = []; _populateOptions: any[] = [];
  constructor(model: any, filter: any) { this.model = model; this.filter = filter; }
  sort(s: any) { this._sort = s; return this; }
  skip(n: number) { this._skip = n; return this; }
  limit(n: number) { this._limit = n; return this; }
  select(fields: string) { if (typeof fields === 'string') this._select.push(...fields.split(/\s+/).filter(Boolean)); return this; }
  populate(path: string, select?: string) { this._populateOptions.push({ path, select }); return this; }
  async exec() {
    const db = getDB();
    const { where, params } = parseFilter(this.filter, this.model.columns);
    let selectClause = '*';
    if (this._select.length > 0) {
      const hasExclusion = this._select.some((f: string) => f.startsWith('-'));
      if (!hasExclusion) {
        const fields = Array.from(new Set(['_id', ...this._select]));
        selectClause = fields.map(f => `"${f}"`).join(', ');
      }
    }
    let sql = `SELECT ${selectClause} FROM "${this.model.tableName}" WHERE ${where}`;
    if (this._sort) {
      const orderClauses: string[] = [];
      for (const key of Object.keys(this._sort)) {
        const dir = this._sort[key] === -1 || this._sort[key] === 'desc' ? 'DESC' : 'ASC';
        orderClauses.push(`"${key}" ${dir}`);
      }
      if (orderClauses.length > 0) sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }
    if (this._limit !== null) sql += ` LIMIT ${this._limit}`;
    if (this._skip !== null) sql += ` OFFSET ${this._skip}`;
    const result = await db.execute({ sql, args: params });
    const docs = result.rows.map((row: any) => {
      const docData: any = {};
      for (const col of this.model.columns) {
        let val = row[col];
        if (this.model.jsonColumns.includes(col)) docData[col] = val ? JSON.parse(val) : (col === 'images' || col === 'addresses' || col === 'products' ? [] : null);
        else docData[col] = val;
      }
      const hasExclusion = this._select.some((f: string) => f.startsWith('-'));
      if (hasExclusion) { for (const field of this._select) { if (field.startsWith('-')) delete docData[field.substring(1)]; } }
      return this.model.wrapDoc(docData);
    });
    if (this._populateOptions.length > 0) await executePopulate(docs, this._populateOptions);
    return docs;
  }
  then(onSuccess: any, onError?: any) { return this.exec().then(onSuccess, onError); }
}

class SingleQueryBuilder {
  model: any; filter: any; _select: string[] = []; _populateOptions: any[] = [];
  constructor(model: any, filter: any) { this.model = model; this.filter = filter; }
  select(fields: string) { if (typeof fields === 'string') this._select.push(...fields.split(/\s+/).filter(Boolean)); return this; }
  populate(path: string, select?: string) { this._populateOptions.push({ path, select }); return this; }
  async exec() {
    const db = getDB();
    const { where, params } = parseFilter(this.filter, this.model.columns);
    let selectClause = '*';
    if (this._select.length > 0) {
      const hasExclusion = this._select.some((f: string) => f.startsWith('-'));
      if (!hasExclusion) {
        const fields = Array.from(new Set(['_id', ...this._select]));
        selectClause = fields.map(f => `"${f}"`).join(', ');
      }
    }
    const sql = `SELECT ${selectClause} FROM "${this.model.tableName}" WHERE ${where} LIMIT 1`;
    const result = await db.execute({ sql, args: params });
    if (result.rows.length === 0) return null;
    const row: any = result.rows[0];
    const docData: any = {};
    for (const col of this.model.columns) {
      let val = row[col];
      if (this.model.jsonColumns.includes(col)) docData[col] = val ? JSON.parse(val) : (col === 'images' || col === 'addresses' || col === 'products' ? [] : null);
      else docData[col] = val;
    }
    const hasExclusion = this._select.some((f: string) => f.startsWith('-'));
    if (hasExclusion) { for (const field of this._select) { if (field.startsWith('-')) delete docData[field.substring(1)]; } }
    const doc = this.model.wrapDoc(docData);
    if (this._populateOptions.length > 0) await executePopulate([doc], this._populateOptions);
    return doc;
  }
  then(onSuccess: any, onError?: any) { return this.exec().then(onSuccess, onError); }
}

export class Document {
  _model: any;
  [key: string]: any;
  constructor(data: any, model: any) {
    Object.assign(this, data);
    Object.defineProperty(this, '_model', { value: model, enumerable: false });
  }
  toObject() { return { ...this }; }
  async save() {
    const db = getDB();
    const columns: string[] = this._model.columns;
    const jsonColumns: string[] = this._model.jsonColumns || [];
    const updateData: any = {};
    for (const col of columns) {
      if (col === '_id') continue;
      let val = this[col];
      if (val !== undefined) {
        if (jsonColumns.includes(col)) updateData[col] = val !== null ? JSON.stringify(val) : null;
        else updateData[col] = val instanceof Date ? val.toISOString() : val;
      }
    }
    if (this._model.timestamps) { updateData.updatedAt = new Date().toISOString(); this.updatedAt = updateData.updatedAt; }
    const setClauses = Object.keys(updateData).map(k => `"${k}" = ?`).join(', ');
    const params = [...Object.values(updateData), this._id];
    const sql = `UPDATE "${this._model.tableName}" SET ${setClauses} WHERE "_id" = ?`;
    await db.execute({ sql, args: params });
    return this;
  }
}

export class BaseModel {
  static get tableName(): string { throw new Error('tableName not defined'); }
  static get columns(): string[] { throw new Error('columns not defined'); }
  static get jsonColumns(): string[] { return []; }
  static get timestamps(): boolean { return true; }
  static get documentClass() { return Document; }
  static wrapDoc(data: any) { return new this.documentClass(data, this); }
  static find(filter: any = {}) { return new QueryBuilder(this, filter); }
  static findOne(filter: any) { return new SingleQueryBuilder(this, filter); }
  static findById(id: string) { return new SingleQueryBuilder(this, { _id: id }); }
  static async create(data: any) {
    const db = getDB();
    const finalData: any = { ...data };
    if (!finalData._id) finalData._id = globalThis.crypto.randomUUID();
    if (this.timestamps) { const now = new Date().toISOString(); finalData.createdAt = now; finalData.updatedAt = now; }
    for (const col of this.columns) {
      if (finalData[col] === undefined) {
        if (col === 'isBlocked' || col === 'active' || col === 'featured') finalData[col] = 0;
        else if (this.jsonColumns.includes(col)) finalData[col] = (col === 'images' || col === 'addresses' || col === 'products') ? [] : null;
        else finalData[col] = null;
      }
    }
    const keys: string[] = []; const values: any[] = []; const placeholders: string[] = [];
    for (const col of this.columns) {
      keys.push(`"${col}"`); placeholders.push('?');
      let val = finalData[col];
      if (this.jsonColumns.includes(col)) values.push(val !== null ? JSON.stringify(val) : null);
      else values.push(val instanceof Date ? val.toISOString() : val);
    }
    const sql = `INSERT INTO "${this.tableName}" (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`;
    await db.execute({ sql, args: values });
    return this.wrapDoc(finalData);
  }
  static async insertMany(arr: any[]) {
    const created = [];
    for (const item of arr) created.push(await this.create(item));
    return created;
  }
  static async findByIdAndUpdate(id: string, update: any, options: any = {}) {
    const doc: any = await this.findById(id);
    if (!doc) return null;
    if (update.$inc) { for (const key of Object.keys(update.$inc)) { if (this.columns.includes(key)) doc[key] = (Number(doc[key]) || 0) + Number(update.$inc[key]); } }
    const fields = update.$set || update;
    for (const key of Object.keys(fields)) { if (key.startsWith('$')) continue; if (this.columns.includes(key)) doc[key] = fields[key]; }
    return await doc.save();
  }
  static async findByIdAndDelete(id: string) {
    const db = getDB();
    const sql = `DELETE FROM "${this.tableName}" WHERE "_id" = ?`;
    return await db.execute({ sql, args: [id] });
  }
  static async deleteMany(filter: any = {}) {
    const db = getDB();
    const { where, params } = parseFilter(filter, this.columns);
    const sql = `DELETE FROM "${this.tableName}" WHERE ${where}`;
    return await db.execute({ sql, args: params });
  }
  static async countDocuments(filter: any = {}) {
    const db = getDB();
    const { where, params } = parseFilter(filter, this.columns);
    const sql = `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE ${where}`;
    const result = await db.execute({ sql, args: params });
    return result.rows[0].count as number;
  }
}
