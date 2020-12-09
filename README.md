# text-message-api

Code test done in 2 hours for easy text-message-service.

To test this api:
1. yarn install
2. yarn start
3. Make http-request with base-url: https://localhost:8080 for each endpoint.

Post message: https://localhost:8080/messages payload: { account_id: 'valid email format', message: string }

Get messages: https://localhost:8080/messages/{account_id(valid email format)}

Delete messages: https://localhost:8080/messages payload: { message_ids: ['valid uuid'] }
