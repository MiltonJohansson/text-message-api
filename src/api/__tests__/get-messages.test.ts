import { Server } from '@hapi/hapi';
import { startService, stopService } from '../../application';
import { clearAllRows, getMessages, storeMessage, updateAlreadyFetched } from '../../db/db';

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
      describe('with stored message', () => {
        const message = {
          account_id: 'test1@tester.com',
          message: 'Test 1',
        };
        beforeEach(async () => {
          await storeMessage(message);
          await storeMessage(message);
          const messages = await getMessages(message.account_id);
          await updateAlreadyFetched(messages[0].message_id);
        });
        afterEach(async () => {
          await clearAllRows();
        });
        describe('with already_fetched query_param set to false', () => {
          it('should return 200', async () => {
            const res = await server.inject({
              method: 'GET',
              url: `/messages/${message.account_id}?only_fresh_messages=false`,
            });
            expect(res.statusCode).toEqual(200);
          });
          it('should return message', async () => {
            const res = await server.inject({
              method: 'GET',
              url: `/messages/${message.account_id}?only_fresh_messages=false`,
            });
            expect((res.result as any)[0].message).toEqual(message.message);
            expect((res.result as any).length).toEqual(2);
          });
        });
        describe('with already_fetched not set', () => {
          it('should return 200', async () => {
            const res = await server.inject({ method: 'GET', url: `/messages/${message.account_id}` });
            expect(res.statusCode).toEqual(200);
          });
          it('should return fresh messages because of default to true', async () => {
            const res = await server.inject({ method: 'GET', url: `/messages/${message.account_id}` });
            expect((res.result as any)[0].message).toEqual(message.message);
            expect((res.result as any).length).toEqual(1);
          });
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
