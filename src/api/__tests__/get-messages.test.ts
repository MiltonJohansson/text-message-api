import { Server } from '@hapi/hapi';
import { startService, stopService } from '../../application';
import { clearAllRows, storeMessage } from '../../db/db';

describe('Get messages', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
    await clearAllRows();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    describe('with correct params', () => {
      describe('with stored transaction', () => {
        const message = {
          account_id: 'test1@tester.com',
          message: 'Test 1',
        };
        beforeEach(async () => {
          await storeMessage(message);
        });
        afterEach(async () => {
          await clearAllRows();
        });
        it('should return 200', async () => {
          const res = await server.inject({ method: 'GET', url: `/messages/${message.account_id}` });
          expect(res.statusCode).toEqual(200);
        });
        it('should return message', async () => {
          const res = await server.inject({ method: 'GET', url: `/messages/${message.account_id}` });
          expect((res.result as any)[0].message).toEqual(message.message);
        });
      });
    });
    describe('with incorrect params', () => {
      it('should return 400', async () => {
        const res = await server.inject({ method: 'GET', url: `/messages/${123}` });
        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
