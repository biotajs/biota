import path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, './../../../../.env') });
import { client as clientFn } from './../../../../tests';

export const client = () => clientFn(process.env.FAUNA_SCHEMA_TEST_KEY);
