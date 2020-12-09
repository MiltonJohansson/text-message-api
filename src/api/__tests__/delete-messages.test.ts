import { Server } from '@hapi/hapi';
import { startService, stopService } from '../../application';
import { clearAllRows, getMessages, storeMessage } from '../../db/db';

describe('Delete message', () => {
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
        const account_id = 'test1@tester.com';
        const message1 = {
          account_id,
          message: 'Test 1',
        };
        const message2 = {
          account_id,
          message: 'Test 2',
        };
        beforeEach(async () => {
          await storeMessage(message1);
          await storeMessage(message2);
        });
        afterEach(async () => {
          await clearAllRows();
        });
        it('should return 200', async () => {
          const messages_before_delete = await getMessages(account_id);
          const res = await server.inject({
            method: 'DELETE',
            url: `/messages`,
            payload: { message_ids: [messages_before_delete[0].message_id] },
          });
          const messages_after_delete = await getMessages(account_id);
          expect(res.statusCode).toEqual(204);
          expect(messages_before_delete.length).toEqual(2);
          expect(messages_after_delete.length).toEqual(1);
        });
      });
    });
    describe('with incorrect params', () => {
      it('should return 400', async () => {
        const res = await server.inject({ method: 'DELETE', url: `/messages`, payload: { message_ids: [1234] } });
        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
