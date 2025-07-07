export interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  subscriber: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
  };
  application_context: {
    brand_name: string;
    locale: string;
    shipping_preference: string;
    user_action: string;
    payment_method: {
      payer_selected: string;
      payee_preferred: string;
    };
    return_url: string;
    cancel_url: string;
  };
}

export interface PayPalPayment {
  id: string;
  status: string;
  amount: {
    total: string;
    currency: string;
  };
  create_time: string;
  update_time: string;
}

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: any; // Define more specific types based on the resource structure
}