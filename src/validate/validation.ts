import joi from 'joi';

export function validatePostMessageRequest() {
  return {
    payload: joi.object({
      account_id: joi.string().email().required(),
      message: joi.string().required(),
    }),
  };
}

export function validateGetTransactionResponse() {
  return joi.array().items(
    joi.object({
      created_at: joi.number().integer().required(),
      message: joi.string().required(),
    }),
  );
}

export function validateGetMessages() {
  return {
    query: joi.object({
      only_fresh_messages: joi.boolean().default(true),
    }),
    options: {
      allowUnknown: true,
    },
    params: joi.object({
      account_id: joi.string().email().required(),
    }),
  };
}

export function validateDeleteMessages() {
  return {
    payload: joi.object({
      message_ids: joi.array().items(joi.string().uuid().required()),
    }),
  };
}
