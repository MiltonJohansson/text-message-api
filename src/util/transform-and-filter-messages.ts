import { StoredInterface, updateAlreadyFetched } from '../db/db';
import { pick } from 'lodash';

export async function transformAndFilterMessages(messages: StoredInterface[], only_fresh_messages: boolean) {
  if (only_fresh_messages) {
    await Promise.all(
      messages.map(async (message) => {
        if (message.already_fetched === 0) {
          await updateAlreadyFetched(message.message_id);
        }
      }),
    );
    return messages
      .filter((message) => message.already_fetched === 0)
      .map((message: StoredInterface) => pick(message, ['message', 'created_at', 'message_id']));
  }
  return messages.map((message: StoredInterface) => pick(message, ['message', 'created_at', 'message_id']));
}
