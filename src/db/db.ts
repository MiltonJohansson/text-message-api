import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Database } from 'sqlite/build/Database';
import Boom from 'boom';
import { v4 as uuidv4 } from 'uuid';
import { sortBy } from 'lodash';

let db: Database;

export async function getOrCreateDb(): Promise<Database> {
  if (db) {
    return db;
  }
  try {
    db = await open({
      filename: '/tmp/database.db',
      driver: sqlite3.Database,
    });
    await db.exec(
      'CREATE TABLE IF NOT EXISTS tbl(message_id type UNIQUE, account_id TEXT, message TEXT, already_fetched BOOLEAN, created_at NUMBER)',
    );
    await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS account_index ON tbl (account_id, message_id)');
    return db;
  } catch (error) {
    throw new Error('Failed to create DB');
  }
}

export async function disconnect() {
  if (!db) {
    return;
  }
  await db.close();
}

export async function clearAllRows() {
  if (!db) {
    return;
  }
  await db.exec('DELETE FROM tbl');
}

export interface StoredInterface {
  message_id: string;
  account_id: string;
  message: string;
  already_fetched: number;
  created_at: number;
}

interface MessageToBeStored {
  message: string;
  account_id: string;
}

export async function storeMessage({ message, account_id }: MessageToBeStored): Promise<void> {
  try {
    const query = 'INSERT INTO tbl VALUES (?, ?, ?, ?, ?)';
    const created_at = new Date().getTime();
    await (await getOrCreateDb()).run(query, [uuidv4().toString(), account_id, message, false, created_at]);
  } catch (error) {
    if (error.errno === 19) {
      throw Boom.conflict('Message already stored');
    }
    throw new Error(error);
  }
}

export async function getMessages(account_id: string): Promise<StoredInterface[]> {
  try {
    const query = 'SELECT * FROM tbl WHERE account_id = ?';
    const messages = await (await getOrCreateDb()).all(query, account_id);
    return sortBy(messages, 'created_at');
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateAlreadyFetched(message_id: string): Promise<any> {
  try {
    const query = 'UPDATE tbl SET already_fetched = ? WHERE message_id = ?';
    return await (await getOrCreateDb()).run(query, [true, message_id]);
  } catch (error) {
    throw new Error(error);
  }
}

export async function deleteMessage(message_id: string): Promise<any> {
  try {
    const query = 'DELETE FROM tbl WHERE message_id = ?';
    return await (await getOrCreateDb()).run(query, message_id);
  } catch (error) {
    throw new Error(error);
  }
}
