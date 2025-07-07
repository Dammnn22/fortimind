import { SubscriptionController } from '../../../src/controllers/subscription';
import { Request, Response } from 'express';

describe('SubscriptionController', () => {
  let subscriptionController: SubscriptionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    subscriptionController = new SubscriptionController();
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('createSubscription', () => {
    it('should create a subscription and return the subscription details', async () => {
      mockRequest.body = {
        userId: 'testUserId',
        planType: 'monthly',
      };

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        subscriptionId: expect.any(String),
        approvalUrl: expect.any(String),
        status: 'ACTIVE',
      }));
    });

    it('should return an error if userId is missing', async () => {
      mockRequest.body = {
        planType: 'monthly',
      };

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'userId is required' });
    });

    it('should return an error if planType is invalid', async () => {
      mockRequest.body = {
        userId: 'testUserId',
        planType: 'invalidPlan',
      };

      await subscriptionController.createSubscription(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid plan type' });
    });
  });

  // Additional tests for other methods can be added here
});