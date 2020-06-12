import path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, './../../../../.env') });
import { client as clientFn, database as databaseFn } from './../../../../tests';

export const secret = process.env.FAUNA_CORE_TEST_KEY;
export const database = () => databaseFn(secret);
export const client = () => clientFn(secret);
