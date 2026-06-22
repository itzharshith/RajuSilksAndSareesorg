import { BaseModel } from './BaseModel';
export class Coupon extends BaseModel {
  static get tableName() { return 'coupons'; }
  static get columns() { return ['_id','code','discountType','discountValue','expiryDate','active','createdAt','updatedAt']; }
  static get jsonColumns() { return []; }
}
