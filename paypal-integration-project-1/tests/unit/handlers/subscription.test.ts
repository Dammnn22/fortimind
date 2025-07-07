import { createPayPalSubscription } from '../../src/handlers/subscription';
import { Request, Response } from 'express';
import { mocked } from 'ts-jest/utils';
import * as paypalService from '../../src/services/paypal';
import * as subscriptionService from '../../src/services/subscription';

jest.mock('../../src/services/paypal');
jest.mock('../../src/services/subscription');

describe('Subscription Handler', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {
      body: {
        userId: 'testUserId',
        planType: 'monthly',
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a PayPal subscription successfully', async () => {
    const mockSubscription = {
      id: 'subscriptionId',
      status: 'ACTIVE',
      approvalUrl: 'http://approval.url',
    };

    mocked(paypalService.createSubscription).mockResolvedValue(mockSubscription);

    await createPayPalSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      subscriptionId: mockSubscription.id,
      approvalUrl: mockSubscription.approvalUrl,
      status: mockSubscription.status,
    });
  });

  it('should return 400 if userId is missing', async () => {
    req.body.userId = undefined;

    await createPayPalSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'userId is required' });
  });

  it('should return 404 if user is not found', async () => {
    mocked(subscriptionService.getUserById).mockResolvedValue(null);

    await createPayPalSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 400 if planType is invalid', async () => {
    req.body.planType = 'invalidPlanType';

    await createPayPalSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid plan type' });
  });

  it('should handle errors from PayPal service', async () => {
    mocked(paypalService.createSubscription).mockRejectedValue(new Error('PayPal error'));

    await createPayPalSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create subscription' });
  });
});