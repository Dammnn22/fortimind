import { createSubscription, getSubscriptionDetails } from '../../src/services/paypal';
import axios from 'axios';

jest.mock('axios');

describe('PayPal Service', () => {
  const mockSubscriptionData = {
    id: 'sub_123',
    status: 'ACTIVE',
    plan_id: 'plan_123',
    subscriber: {
      name: {
        given_name: 'John',
        surname: 'Doe',
      },
      email_address: 'john.doe@example.com',
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      const mockResponse = {
        data: mockSubscriptionData,
      };

      (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await createSubscription('user_123', 'monthly');

      expect(axios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.any(Object));
      expect(result).toEqual(mockSubscriptionData);
    });

    it('should throw an error when subscription creation fails', async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Failed to create subscription'));

      await expect(createSubscription('user_123', 'monthly')).rejects.toThrow('Failed to create subscription');
    });
  });

  describe('getSubscriptionDetails', () => {
    it('should retrieve subscription details successfully', async () => {
      const mockResponse = {
        data: mockSubscriptionData,
      };

      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getSubscriptionDetails('sub_123');

      expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
      expect(result).toEqual(mockSubscriptionData);
    });

    it('should throw an error when retrieving subscription details fails', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to retrieve subscription details'));

      await expect(getSubscriptionDetails('sub_123')).rejects.toThrow('Failed to retrieve subscription details');
    });
  });
});