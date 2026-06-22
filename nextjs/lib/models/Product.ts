import { BaseModel } from './BaseModel';
export class Product extends BaseModel {
  static get tableName() { return 'products'; }
  static get columns() { return ['_id','name','description','category','images','price','stock','discount','featured','createdAt','updatedAt']; }
  static get jsonColumns() { return ['images']; }
}
