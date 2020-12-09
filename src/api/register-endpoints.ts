import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import {
  validateDeleteMessages,
  validateGetMessages,
  validatePostMessageRequest,
  validateGetTransactionResponse,
} from '../validate/validation';
import { deleteMessage, getMessages, storeMessage } from '../db/db';
import { transformAndFilterMessages } from '../util/transform-and-filter-messages';

export async function registerEndpoints(server: Server) {
  server.route({
    method: 'GET',
    path: '/ping',
    handler: handlePing,
  });
  server.route({
    method: 'POST',
    path: '/messages',
    handler: handlePostMessage,
    options: {
      validate: validatePostMessageRequest(),
    },
  });
  server.route({
    method: 'GET',
    path: '/messages/{account_id}',
    handler: handleGetMessages,
    options: {
      validate: validateGetMessages(),
      response: {
        schema: validateGetTransactionResponse(),
        failAction: 'error',
      },
    },
  });

  server.route({
    method: 'DELETE',
    path: '/messages',
    handler: handleDeleteMessages,
    options: {
      validate: validateDeleteMessages(),
    },
  });
}

const handlePing = async (_req: Request, h: ResponseToolkit) => {
  return h.response({}).code(200);
};

const handlePostMessage = async ({ payload }: Request, h: ResponseToolkit) => {
  try {
    await storeMessage({
      account_id: (payload as any).account_id,
      message: (payload as any).message,
    });
    return h.response({}).code(200);
  } catch (error) {
    throw error;
  }
};

const handleGetMessages = async ({ params: { account_id }, query: { only_fresh_messages } }: Request, h: ResponseToolkit) => {
  try {
    const messages = await getMessages(account_id);
    const transformed_and_filtered_messages = await transformAndFilterMessages(messages, only_fresh_messages);
    return h.response(transformed_and_filtered_messages).code(200);
  } catch (error) {
    throw error;
  }
};

const handleDeleteMessages = async ({ payload }: Request, h: ResponseToolkit) => {
  try {
    await Promise.all(
      (payload as any).message_ids.map(async (message_id: string) => {
        await deleteMessage(message_id);
      }),
    );
    return h.response().code(204);
  } catch (error) {
    throw error;
  }
};
