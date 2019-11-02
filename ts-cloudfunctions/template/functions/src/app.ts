import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WrappedExpress } from './helper/server';
import Ping from './endpoints/Ping';
import { env } from './helper/env';
import { logger } from './helper/logger';

const _app = express();
_app.use(bodyParser.json());
_app.use(cors());

async function initialize(): Promise<void> {}
export const app = new WrappedExpress({ application: _app, initialize });

export const ping = app.createPostHandler<Ping.Interface>('ping', Ping.Handler, Ping.Schema);
