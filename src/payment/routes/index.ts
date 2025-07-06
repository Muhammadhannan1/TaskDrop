export class PaymentApiRoutes {
  static readonly Root = 'payment';
  static readonly AddCard = '/add/cards';
  static readonly DetachCard = '/detach/cards/:paymentMethodId';

  static readonly ListMyCard = '/cards';

  static readonly CreateCustomer = '/create/customer';
  static readonly Initiate = '/start';
  static readonly Accept = '/accept/:paymentIntentId';
  static readonly Capture = '/capture/:paymentIntentId';
  static readonly Cancel = '/cancel/:paymentIntentId';
  static readonly Refund = '/refund';

  static readonly acceptBooking = '/accept/decline/:bookingId';
}
