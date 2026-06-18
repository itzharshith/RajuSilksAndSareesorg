const crypto = require('crypto');

// Parser to translate MongoDB style queries to SQL where clauses
function parseFilter(filter, tableColumns) {
  let conditions = [];
  let params = [];

  if (!filter || Object.keys(filter).length === 0) {
    return { where: '1=1', params: [] };
  }

  // Handle $or at root level
  if (filter.$or && Array.isArray(filter.$or)) {
    const subConds = [];
    for (const subFilter of filter.$or) {
      const res = parseFilter(subFilter, tableColumns);
      if (res.where !== '1=1') {
        subConds.push(`(${res.where})`);
        params.push(...res.params);
      }
    }
    if (subConds.length > 0) {
      conditions.push(`(${subConds.join(' OR ')})`);
    }
  }

  // Handle other keys
  for (const key of Object.keys(filter)) {
    if (key === '$or') continue;

    const val = filter[key];

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      // Check for operators
      for (const op of Object.keys(val)) {
        if (op === '$regex') {
          let pattern = val[op];
          if (pattern instanceof RegExp) {
            pattern = pattern.source;
          }
          // Convert simple regex searches to LIKE
          let cleanPattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
          conditions.push(`"${key}" LIKE ?`);
          params.push(`%${cleanPattern}%`);
        } else if (op === '$gte') {
          conditions.push(`"${key}" >= ?`);
          params.push(val[op]);
        } else if (op === '$lte') {
          conditions.push(`"${key}" <= ?`);
          params.push(val[op]);
        } else if (op === '$gt') {
          conditions.push(`"${key}" > ?`);
          params.push(val[op]);
        } else if (op === '$lt') {
          conditions.push(`"${key}" < ?`);
          params.push(val[op]);
        } else if (op === '$ne') {
          conditions.push(`"${key}" != ?`);
          params.push(val[op]);
        } else if (op === '$in') {
          if (Array.isArray(val[op]) && val[op].length > 0) {
            const placeholders = val[op].map(() => '?').join(',');
            conditions.push(`"${key}" IN (${placeholders})`);
            params.push(...val[op]);
          } else {
            conditions.push('1=0');
          }
        }
      }
    } else {
      // Simple equality
      conditions.push(`"${key}" = ?`);
      params.push(val instanceof Date ? val.toISOString() : val);
    }
  }

  if (conditions.length === 0) {
    return { where: '1=1', params: [] };
  }

  return { where: conditions.join(' AND '), params };
}

// Populate helper to resolve references
async function executePopulate(docs, populateOptions) {
  if (!docs || docs.length === 0 || populateOptions.length === 0) return;

  for (const option of populateOptions) {
    const { path, select } = option;

    // Handle nested path: products.product
    if (path.includes('.')) {
      const [parentPath, childPath] = path.split('.');
      
      const childIds = new Set();
      for (const doc of docs) {
        const parentVal = doc[parentPath];
        if (Array.isArray(parentVal)) {
          for (const item of parentVal) {
            if (item && item[childPath]) {
              childIds.add(item[childPath]);
            }
          }
        } else if (parentVal && parentVal[childPath]) {
          childIds.add(parentVal[childPath]);
        }
      }

      if (childIds.size === 0) continue;

      const childModel = require('./Product');
      const childDocs = await childModel.find({ _id: { $in: Array.from(childIds) } });
      const childMap = new Map(childDocs.map(d => [d._id.toString(), d]));

      for (const doc of docs) {
        const parentVal = doc[parentPath];
        if (Array.isArray(parentVal)) {
          for (const item of parentVal) {
            if (item && item[childPath]) {
              const matched = childMap.get(item[childPath].toString()) || null;
              item[childPath] = matched;
            }
          }
        } else if (parentVal && parentVal[childPath]) {
          const matched = childMap.get(parentVal[childPath].toString()) || null;
          parentVal[childPath] = matched;
        }
      }
    } else {
      // Direct path (e.g. 'category' or 'user')
      const ids = new Set();
      for (const doc of docs) {
        if (doc[path]) ids.add(doc[path]);
      }

      if (ids.size === 0) continue;

      let refModel;
      if (path === 'category') refModel = require('./Category');
      else if (path === 'user') refModel = require('./User');
      else if (path === 'product') refModel = require('./Product');

      if (!refModel) continue;

      const refDocs = await refModel.find({ _id: { $in: Array.from(ids) } });
      
      let selectFields = [];
      if (select) {
        selectFields = select.split(/\s+/).filter(Boolean);
      }

      const refMap = new Map();
      for (const rDoc of refDocs) {
        let cleanDoc = { ...rDoc };
        if (selectFields.length > 0) {
          const kept = { _id: rDoc._id };
          for (const field of selectFields) {
            if (field.startsWith('-')) {
              delete cleanDoc[field.substring(1)];
            } else {
              kept[field] = rDoc[field];
            }
          }
          if (!select.includes('-')) {
            cleanDoc = kept;
          }
        }
        refMap.set(rDoc._id.toString(), cleanDoc);
      }

      for (const doc of docs) {
        if (doc[path]) {
          doc[path] = refMap.get(doc[path].toString()) || null;
        }
      }
    }
  }
}

// Chainable query builder for find operations
class QueryBuilder {
  constructor(model, filter) {
    this.model = model;
    this.filter = filter;
    this._sort = null;
    this._skip = null;
    this._limit = null;
    this._select = [];
    this._populateOptions = [];
  }

  sort(sortOption) {
    this._sort = sortOption;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      this._select.push(...fields.split(/\s+/).filter(Boolean));
    }
    return this;
  }

  populate(path, select) {
    this._populateOptions.push({ path, select });
    return this;
  }

  async exec() {
    const db = require('../config/db').getDB();
    const { where, params } = parseFilter(this.filter, this.model.columns);

    let selectClause = '*';
    if (this._select.length > 0) {
      const hasExclusion = this._select.some(f => f.startsWith('-'));
      if (!hasExclusion) {
        const fields = Array.from(new Set(['_id', ...this._select]));
        selectClause = fields.map(f => `"${f}"`).join(', ');
      }
    }

    let sql = `SELECT ${selectClause} FROM "${this.model.tableName}" WHERE ${where}`;

    if (this._sort) {
      const orderClauses = [];
      for (const key of Object.keys(this._sort)) {
        const dir = this._sort[key] === -1 || this._sort[key] === 'desc' ? 'DESC' : 'ASC';
        orderClauses.push(`"${key}" ${dir}`);
      }
      if (orderClauses.length > 0) {
        sql += ` ORDER BY ${orderClauses.join(', ')}`;
      }
    }

    if (this._limit !== null) {
      sql += ` LIMIT ${this._limit}`;
    }

    if (this._skip !== null) {
      sql += ` OFFSET ${this._skip}`;
    }

    const result = await db.execute({ sql, args: params });
    const docs = result.rows.map(row => {
      const docData = {};
      for (const col of this.model.columns) {
        let val = row[col];
        if (this.model.jsonColumns.includes(col)) {
          docData[col] = val ? JSON.parse(val) : (col === 'images' || col === 'addresses' || col === 'products' ? [] : null);
        } else {
          docData[col] = val;
        }
      }

      const hasExclusion = this._select.some(f => f.startsWith('-'));
      if (hasExclusion) {
        for (const field of this._select) {
          if (field.startsWith('-')) {
            delete docData[field.substring(1)];
          }
        }
      }

      return this.model.wrapDoc(docData);
    });

    if (this._populateOptions.length > 0) {
      await executePopulate(docs, this._populateOptions);
    }

    return docs;
  }

  then(onSuccess, onError) {
    return this.exec().then(onSuccess, onError);
  }
}

// Chainable query builder for findOne operations
class SingleQueryBuilder {
  constructor(model, filter) {
    this.model = model;
    this.filter = filter;
    this._select = [];
    this._populateOptions = [];
  }

  select(fields) {
    if (typeof fields === 'string') {
      this._select.push(...fields.split(/\s+/).filter(Boolean));
    }
    return this;
  }

  populate(path, select) {
    this._populateOptions.push({ path, select });
    return this;
  }

  async exec() {
    const db = require('../config/db').getDB();
    const { where, params } = parseFilter(this.filter, this.model.columns);

    let selectClause = '*';
    if (this._select.length > 0) {
      const hasExclusion = this._select.some(f => f.startsWith('-'));
      if (!hasExclusion) {
        const fields = Array.from(new Set(['_id', ...this._select]));
        selectClause = fields.map(f => `"${f}"`).join(', ');
      }
    }

    const sql = `SELECT ${selectClause} FROM "${this.model.tableName}" WHERE ${where} LIMIT 1`;
    const result = await db.execute({ sql, args: params });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const docData = {};
    for (const col of this.model.columns) {
      let val = row[col];
      if (this.model.jsonColumns.includes(col)) {
        docData[col] = val ? JSON.parse(val) : (col === 'images' || col === 'addresses' || col === 'products' ? [] : null);
      } else {
        docData[col] = val;
      }
    }

    const hasExclusion = this._select.some(f => f.startsWith('-'));
    if (hasExclusion) {
      for (const field of this._select) {
        if (field.startsWith('-')) {
          delete docData[field.substring(1)];
        }
      }
    }

    const doc = this.model.wrapDoc(docData);

    if (this._populateOptions.length > 0) {
      await executePopulate([doc], this._populateOptions);
    }

    return doc;
  }

  then(onSuccess, onError) {
    return this.exec().then(onSuccess, onError);
  }
}

// Base Document class for individual records
class Document {
  constructor(data, model) {
    Object.assign(this, data);
    Object.defineProperty(this, '_model', { value: model, enumerable: false });
  }

  toObject() {
    return { ...this };
  }

  async save() {
    const columns = this._model.columns;
    const jsonColumns = this._model.jsonColumns || [];
    
    const updateData = {};
    for (const col of columns) {
      if (col === '_id') continue;
      
      let val = this[col];
      if (val !== undefined) {
        if (jsonColumns.includes(col)) {
          updateData[col] = val !== null ? JSON.stringify(val) : null;
        } else {
          updateData[col] = val instanceof Date ? val.toISOString() : val;
        }
      }
    }

    if (this._model.timestamps) {
      updateData.updatedAt = new Date().toISOString();
      this.updatedAt = updateData.updatedAt;
    }

    const setClauses = Object.keys(updateData).map(k => `"${k}" = ?`).join(', ');
    const params = Object.values(updateData);
    params.push(this._id);

    const sql = `UPDATE "${this._model.tableName}" SET ${setClauses} WHERE "_id" = ?`;
    const db = require('../config/db').getDB();
    await db.execute({ sql, args: params });
    return this;
  }
}

// BaseModel interface mimicking mongoose model schema methods
class BaseModel {
  static get tableName() {
    throw new Error('tableName not defined');
  }

  static get columns() {
    throw new Error('columns not defined');
  }

  static get jsonColumns() {
    return [];
  }

  static get timestamps() {
    return true;
  }

  static get documentClass() {
    return Document;
  }

  static wrapDoc(data) {
    return new this.documentClass(data, this);
  }

  static find(filter) {
    return new QueryBuilder(this, filter);
  }

  static findOne(filter) {
    return new SingleQueryBuilder(this, filter);
  }

  static findById(id) {
    return new SingleQueryBuilder(this, { _id: id });
  }

  static async create(data) {
    const db = require('../config/db').getDB();
    const finalData = { ...data };

    if (!finalData._id) {
      // If UUID is needed
      finalData._id = crypto.randomUUID();
    }

    if (this.timestamps) {
      const now = new Date().toISOString();
      finalData.createdAt = now;
      finalData.updatedAt = now;
    }

    // Set defaults
    for (const col of this.columns) {
      if (finalData[col] === undefined) {
        if (col === 'isBlocked' || col === 'active' || col === 'featured') {
          finalData[col] = 0;
        } else if (this.jsonColumns.includes(col)) {
          finalData[col] = (col === 'images' || col === 'addresses' || col === 'products') ? [] : null;
        } else {
          finalData[col] = null;
        }
      }
    }

    const keys = [];
    const values = [];
    const placeholders = [];

    for (const col of this.columns) {
      keys.push(`"${col}"`);
      placeholders.push('?');
      let val = finalData[col];
      if (this.jsonColumns.includes(col)) {
        values.push(val !== null ? JSON.stringify(val) : null);
      } else {
        values.push(val instanceof Date ? val.toISOString() : val);
      }
    }

    const sql = `INSERT INTO "${this.tableName}" (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`;
    await db.execute({ sql, args: values });
    return this.wrapDoc(finalData);
  }

  static async insertMany(arr) {
    const created = [];
    for (const item of arr) {
      const res = await this.create(item);
      created.push(res);
    }
    return created;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const doc = await this.findById(id);
    if (!doc) return null;

    // Handle $inc operator
    if (update.$inc) {
      for (const key of Object.keys(update.$inc)) {
        if (this.columns.includes(key)) {
          const currentVal = Number(doc[key]) || 0;
          doc[key] = currentVal + Number(update.$inc[key]);
        }
      }
    }

    const fields = update.$set || update;
    for (const key of Object.keys(fields)) {
      if (key.startsWith('$')) continue; // Skip operator keys like $inc or $set
      if (this.columns.includes(key)) {
        doc[key] = fields[key];
      }
    }
    return await doc.save();
  }

  static async findByIdAndDelete(id) {
    const db = require('../config/db').getDB();
    const sql = `DELETE FROM "${this.tableName}" WHERE "_id" = ?`;
    const res = await db.execute({ sql, args: [id] });
    return res;
  }

  static async deleteMany(filter) {
    const db = require('../config/db').getDB();
    const { where, params } = parseFilter(filter, this.columns);
    const sql = `DELETE FROM "${this.tableName}" WHERE ${where}`;
    return await db.execute({ sql, args: params });
  }

  static async countDocuments(filter) {
    const db = require('../config/db').getDB();
    const { where, params } = parseFilter(filter, this.columns);
    const sql = `SELECT COUNT(*) as count FROM "${this.tableName}" WHERE ${where}`;
    const result = await db.execute({ sql, args: params });
    return result.rows[0].count;
  }
}

module.exports = { BaseModel, Document };
