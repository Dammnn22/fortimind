import request from 'supertest';
import app from '../../src/index'; // Adjust the path as necessary
import { mockWebhookEvent } from '../mocks/webhookMocks'; // Assuming you have mock data for webhook events

describe('PayPal Webhook Integration Tests', () => {
  it('should process BILLING.SUBSCRIPTION.ACTIVATED event', async () => {
    const response = await request(app)
      .post('/webhook') // Adjust the endpoint as necessary
      .send(mockWebhookEvent.subscriptionActivated);

    expect(response.status).toBe(200);
    // Add more assertions based on expected behavior
  });

  it('should process BILLING.SUBSCRIPTION.CANCELLED event', async () => {
    const response = await request(app)
      .post('/webhook')
      .send(mockWebhookEvent.subscriptionCancelled);

    expect(response.status).toBe(200);
    // Add more assertions based on expected behavior
  });

  it('should process BILLING.SUBSCRIPTION.EXPIRED event', async () => {
    const response = await request(app)
      .post('/webhook')
      .send(mockWebhookEvent.subscriptionExpired);

    expect(response.status).toBe(200);
    // Add more assertions based on expected behavior
  });

  it('should return 400 for unsupported event types', async () => {
    const response = await request(app)
      .post('/webhook')
      .send({ event_type: 'UNSUPPORTED.EVENT' });

    expect(response.status).toBe(400);
  });
});