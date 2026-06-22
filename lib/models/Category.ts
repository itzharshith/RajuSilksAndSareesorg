import { BaseModel } from './BaseModel';
export class Category extends BaseModel {
  static get tableName() { return 'categories'; }
  static get columns() { return ['_id','name','image','createdAt','updatedAt']; }
  static get jsonColumns() { return []; }
}
