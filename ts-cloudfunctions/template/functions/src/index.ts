import { env } from './helper/env';
import { logger } from './helper/logger';
import * as functions from 'firebase-functions';
import { app } from './app';

/**
 * @description
 * you must export functions.https.onRequest(handler);
 */
export const server = functions.https.onRequest(app.application());
