import { BaseModel } from './BaseModel';
export class Review extends BaseModel {
  static get tableName() { return 'reviews'; }
  static get columns() { return ['_id','user','product','rating','comment','createdAt','updatedAt']; }
  static get jsonColumns() { return []; }
}
