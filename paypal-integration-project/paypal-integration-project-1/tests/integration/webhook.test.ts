import request from 'supertest';
import app from '../../src/index'; // Adjust the path as necessary
import { WebhookController } from '../../src/controllers/webhook';

describe('Webhook Integration Tests', () => {
  let webhookController: WebhookController;

  beforeAll(() => {
    webhookController = new WebhookController();
  });

  it('should process BILLING.SUBSCRIPTION.ACTIVATED event', async () => {
    const event = {
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: {
        id: 'test_subscription_id',
        status: 'ACTIVE',
      },
    };

    const response = await request(app)
      .post('/webhook') // Adjust the endpoint as necessary
      .send(event)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should process BILLING.SUBSCRIPTION.CANCELLED event', async () => {
    const event = {
      event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: {
        id: 'test_subscription_id',
        status: 'CANCELLED',
      },
    };

    const response = await request(app)
      .post('/webhook') // Adjust the endpoint as necessary
      .send(event)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should return 400 for unsupported event types', async () => {
    const event = {
      event_type: 'UNSUPPORTED.EVENT',
      resource: {},
    };

    const response = await request(app)
      .post('/webhook') // Adjust the endpoint as necessary
      .send(event)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Unsupported event type');
  });
});