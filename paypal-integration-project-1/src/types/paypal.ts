export interface PayPalSubscription {
  id: string;
  status: string;
  create_time: string;
  update_time: string;
  subscriber: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
  };
  plan_id: string;
  application_context: {
    brand_name: string;
    locale: string;
    shipping_preference: string;
    user_action: string;
    return_url: string;
    cancel_url: string;
  };
}

export interface PayPalPayment {
  id: string;
  status: string;
  create_time: string;
  update_time: string;
  amount: {
    total: string;
    currency: string;
  };
  payer: {
    email_address: string;
  };
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: any; // This can be further defined based on specific event types
}