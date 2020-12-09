import {
  clearAllRows,
  disconnect,
  getOrCreateDb,
  getMessages,
  storeMessage,
  deleteMessage,
  updateAlreadyFetched,
  StoredInterface,
} from '../db';
import { pick } from 'lodash';

describe('Test database', () => {
  beforeEach(async () => {
    await getOrCreateDb();
    await clearAllRows();
  });
  afterAll(async () => {
    await disconnect();
  });
  describe('Test database', () => {
    const account_one = 'test1@tester.com';
    const account_two = 'test2@tester.com';
    const message_one_account_one = {
      account_id: account_one,
      message: 'Test message 1',
    };
    const message_two_account_one = {
      account_id: account_one,
      message: 'Test message 2',
    };

    const message_one_account_two = {
      account_id: account_two,
      message: 'Test message 3',
    };
    const message_two_account_two = {
      account_id: account_two,
      message: 'Test message 4',
    };
    beforeEach(async () => {
      await storeMessage(message_one_account_one);
      await storeMessage(message_two_account_one);
      await storeMessage(message_one_account_two);
      await storeMessage(message_two_account_two);
    });

    it('should get all messages for account one', async () => {
      const messages = await getMessages(account_one);
      expect(messages.length).toEqual(2);
      expect(messages.map((message: StoredInterface) => pick(message, ['message', 'account_id']))).toEqual([
        message_one_account_one,
        message_two_account_one,
      ]);
    });
    it('should get all messages for account two', async () => {
      const messages = await getMessages(account_two);
      expect(messages.length).toEqual(2);
      expect(messages.map((message: StoredInterface) => pick(message, ['message', 'account_id']))).toEqual([
        message_one_account_two,
        message_two_account_two,
      ]);
    });
    it('should delete message', async () => {
      const messages_before_delete = await getMessages(account_one);
      await deleteMessage(messages_before_delete[0].message_id);
      const messages_after_delete = await getMessages(account_one);
      expect(messages_before_delete.length).toEqual(2);
      expect(messages_after_delete.length).toEqual(1);
    });
    it('should update already_fetched', async () => {
      const messages_before_update = await getMessages(account_one);
      await updateAlreadyFetched(messages_before_update[0].message_id);
      const messages_after_update = await getMessages(account_one);
      expect(messages_before_update[0].already_fetched).toEqual(0);
      expect(messages_after_update[0].already_fetched).toEqual(1);
    });
  });
});
