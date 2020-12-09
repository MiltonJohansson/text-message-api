import { pick } from 'lodash';
import { startService, stopService } from '../../application';
import { clearAllRows, getMessages, StoredInterface } from '../../db/db';
import { Server } from '@hapi/hapi';

describe('Post message', () => {
  let server: Server;
  beforeAll(async () => {
    server = await startService();
    await clearAllRows();
  });
  afterAll(async () => {
    await stopService();
  });
  describe('call endpoint', () => {
    describe('with correct payload', () => {
      const correct_payload = { account_id: 'test1@tester.com', message: 'TEST1' };
      afterEach(async () => {
        await clearAllRows();
      });
      it('should return 200', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/messages',
          payload: correct_payload,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.result).toEqual({});
      });
      it('should have stored message', async () => {
        await server.inject({ method: 'POST', url: '/messages', payload: correct_payload });
        const messages = await getMessages(correct_payload.account_id);
        expect(messages.map((message: StoredInterface) => pick(message, ['message', 'account_id']))).toEqual([correct_payload]);
      });
    });
    describe('with incorrect payload', () => {
      const incorrect_payload = { account_id: 123, amount: '123' };
      it('should return 400', async () => {
        const res = await server.inject({
          method: 'POST',
          url: '/messages',
          payload: incorrect_payload,
        });
        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
