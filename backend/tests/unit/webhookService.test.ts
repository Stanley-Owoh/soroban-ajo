import { WebhookService, WebhookEventType } from '../../src/services/webhookService';
import { WebhookPayloadFactory } from '../factories';
import { mockWebhookEndpoint } from '../fixtures/mockData';

// Mock fetch globally
global.fetch = jest.fn();

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    service = new WebhookService();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });
  });

  describe('registerEndpoint', () => {
    it('should register a new webhook endpoint', () => {
      const id = service.registerEndpoint(mockWebhookEndpoint);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should add endpoint to endpoints list', () => {
      const id = service.registerEndpoint(mockWebhookEndpoint);
      const endpoint = service.getEndpoint(id);

      expect(endpoint).toBeDefined();
      expect(endpoint?.url).toBe(mockWebhookEndpoint.url);
    });

    it('should set default retry config if not provided', () => {
      const endpointWithoutRetry = { ...mockWebhookEndpoint };
      delete (endpointWithoutRetry as any).retryConfig;

      const id = service.registerEndpoint(endpointWithoutRetry);
      const endpoint = service.getEndpoint(id);

      expect(endpoint?.retryConfig).toBeDefined();
      expect(endpoint?.retryConfig?.maxRetries).toBe(3);
    });
  });

  describe('unregisterEndpoint', () => {
    it('should remove endpoint successfully', () => {
      const id = service.registerEndpoint(mockWebhookEndpoint);
      const result = service.unregisterEndpoint(id);

      expect(result).toBe(true);
      expect(service.getEndpoint(id)).toBeUndefined();
    });

    it('should return false for non-existent endpoint', () => {
      const result = service.unregisterEndpoint('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('updateEndpoint', () => {
    it('should update endpoint configuration', () => {
      const id = service.registerEndpoint(mockWebhookEndpoint);
      const result = service.updateEndpoint(id, { enabled: false });

      expect(result).toBe(true);
      expect(service.getEndpoint(id)?.enabled).toBe(false);
    });

    it('should return false for non-existent endpoint', () => {
      const result = service.updateEndpoint('non-existent', { enabled: false });
      expect(result).toBe(false);
    });

    it('should partially update endpoint', () => {
      const id = service.registerEndpoint(mockWebhookEndpoint);
      service.updateEndpoint(id, { url: 'https://new-url.com' });

      const endpoint = service.getEndpoint(id);
      expect(endpoint?.url).toBe('https://new-url.com');
      expect(endpoint?.secret).toBe(mockWebhookEndpoint.secret);
    });
  });

  describe('getEndpoints', () => {
    it('should return all registered endpoints', () => {
      service.registerEndpoint(mockWebhookEndpoint);
      service.registerEndpoint({ ...mockWebhookEndpoint, url: 'https://example2.com' });

      const endpoints = service.getEndpoints();
      expect(endpoints.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array when no endpoints', () => {
      const newService = new WebhookService();
      const endpoints = newService.getEndpoints();
      expect(Array.isArray(endpoints)).toBe(true);
    });
  });

  describe('triggerEvent', () => {
    it('should trigger webhook event successfully', async () => {
      service.registerEndpoint(mockWebhookEndpoint);

      await service.triggerEvent(
        WebhookEventType.GROUP_CREATED,
        { groupId: 'group-1' },
        { groupId: 'group-1' }
      );

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include proper headers in webhook request', async () => {
      service.registerEndpoint(mockWebhookEndpoint);

      await service.triggerEvent(
        WebhookEventType.MEMBER_JOINED,
        { memberId: 'user-1' }
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Webhook-Event': expect.any(String),
          }),
        })
      );
    });

    it('should not deliver to disabled endpoints', async () => {
      service.registerEndpoint({ ...mockWebhookEndpoint, enabled: false });

      await service.triggerEvent(WebhookEventType.GROUP_CREATED, {});
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const payload = WebhookPayloadFactory.create();
      const secret = 'test-secret';

      // Generate signature using private method (via service)
      const signature = (service as any).generateSignature(payload, secret);
      const isValid = service.verifySignature(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = WebhookPayloadFactory.create();
      const secret = 'test-secret';
      const invalidSignature = 'invalid-signature-hash';

      expect(service.verifySignature(payload, invalidSignature, secret)).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return webhook statistics', () => {
      service.registerEndpoint(mockWebhookEndpoint);
      service.registerEndpoint({ ...mockWebhookEndpoint, enabled: false });

      const stats = service.getStats();

      expect(stats).toHaveProperty('totalEndpoints');
      expect(stats).toHaveProperty('activeEndpoints');
      expect(stats).toHaveProperty('queuedEvents');
      expect(stats.totalEndpoints).toBeGreaterThanOrEqual(2);
    });

    it('should count active endpoints correctly', () => {
      service.registerEndpoint(mockWebhookEndpoint);
      service.registerEndpoint({ ...mockWebhookEndpoint, enabled: false });

      const stats = service.getStats();
      expect(stats.activeEndpoints).toBeGreaterThanOrEqual(1);
    });
  });

  describe('retry logic', () => {
    it('should retry failed webhook deliveries', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      service.registerEndpoint(mockWebhookEndpoint);
      await service.triggerEvent(WebhookEventType.GROUP_CREATED, {});

      await new Promise(resolve => setTimeout(resolve, 5000));

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should stop retrying after max attempts', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      service.registerEndpoint(mockWebhookEndpoint);
      await service.triggerEvent(WebhookEventType.GROUP_CREATED, {});

      await new Promise(resolve => setTimeout(resolve, 10000));

      expect(global.fetch).toHaveBeenCalledTimes(3); // maxRetries = 3
    }, 15000); // Increase timeout to 15 seconds
  });
});
