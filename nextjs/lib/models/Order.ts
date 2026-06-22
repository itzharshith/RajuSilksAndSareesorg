import { BaseModel } from './BaseModel';
export class Order extends BaseModel {
  static get tableName() { return 'orders'; }
  static get columns() { return ['_id','user','products','totalAmount','discountAmount','taxAmount','shippingCharges','paymentStatus','orderStatus','shippingAddress','paymentDetails','couponApplied','createdAt','updatedAt']; }
  static get jsonColumns() { return ['products','shippingAddress','paymentDetails']; }
}
