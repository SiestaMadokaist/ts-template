import { Maybe } from '@cryptoket/ts-maybe';
import { Memoize } from '@cryptoket/ts-memoize';
import express from 'express';
import { BaseException } from './errors';
import { logger } from './logger';
import { PostEndpoint } from './types';
import { IncomingHttpHeaders } from 'http';
import { JoiOf, parseBody } from './utility';
import joiToSwagger from 'joi-to-swagger';
import { env } from './env';
import { LambdaContext, FinalizedLambdaAPIHandler, createLambdaAPI, LambdaEvent, LambdaHandler } from './lambda';

interface EndpointHeaders extends IncomingHttpHeaders {
  Authorization?: string;
}
interface EndpointRequestPost<Body> {
  body: Body;
  headers?: EndpointHeaders;
}

interface ErrorObject {
  error: true;
  message: string;
  name: string;
}

interface SuccessObject<Data> {
  error: false;
  data: Data;
}

interface EndpointResponse<Data> extends express.Response {
  send(data: ErrorObject | SuccessObject<Data>): this;
}

export type PostHandler<T extends PostEndpoint> = (req: EndpointRequestPost<T['body']>) => Promise<T['response']>;

type RequestHandler<T> = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<T>;

export interface IWrappedExpress {
  application: express.Express;
  initialize: () => Promise<void>;
}

export class WrappedExpress {
  __memo__: {
    initialization?: Promise<boolean>;
  } = {};
  constructor(private props: IWrappedExpress) {}

  application(): IWrappedExpress['application'] {
    return this.props.application;
  }

  async listen(port: string | number): Promise<void> {
    this.application().listen(port, () => {
      logger.log({
        listeningOn: port,
        nodeVersion: process.version,
      });
    });
  }

  private createSwagger<PE extends PostEndpoint = never>(schema: JoiOf<PE['body']>): RequestHandler<void> {
    return async (_, res, __) => {
      const s = joiToSwagger(schema);
      res.status(200).send(s.swagger);
    };
  }

  private createExpressHandler<PE extends PostEndpoint = never>(path: PE['path'], handler: PostHandler<PE>, schema: JoiOf<PE['body']>): void {
    if (env.LAMBDA_ENV === 'true') { return; }
    const dirtyPath = path.replace(/^\/+/, '');
    const cleanPath = `/${dirtyPath}`;
    const swaggerPath = `/swagger/${dirtyPath}`;
    this.application().post(cleanPath, this.expressWrap<PE>(201, handler, schema));
    this.application().get(swaggerPath, this.createSwagger(schema));
  }

  private async initialize(): Promise<boolean> {
    return Memoize(this, 'initialization', async () => {
      const { initialize } = this.props;
      await initialize();
      return true;
    });
  }

  private createLambdaHandler<PE extends PostEndpoint = never>(path: PE['path'], handler: PostHandler<PE>, schema: JoiOf<PE['body']>): FinalizedLambdaAPIHandler<PE> {
    const { initialize } = this.props;
    const lambdaHandler: LambdaHandler<PE> = async (event: LambdaEvent<PE>, context?: LambdaContext) => {
      await this.initialize();
      const result = await handler(event);
      return { data: result, statusCode: 201 };
    };
    return createLambdaAPI(lambdaHandler, schema);
  }

  createPostHandler<PE extends PostEndpoint = never>(path: PE['path'], handler: PostHandler<PE>, schema: JoiOf<PE['body']>): FinalizedLambdaAPIHandler<PE> {
    this.createExpressHandler(path, handler, schema);
    return this.createLambdaHandler(path, handler, schema);
  }

  private expressWrap<PE extends PostEndpoint>(code: number, handler: RequestHandler<PE['response']>, schema: JoiOf<PE['body']>): RequestHandler<void> {
    const wrapped = async (req: express.Request, res: EndpointResponse<PE['response']>, next: express.NextFunction) => {
      this.initialize()
      .then(() => parseBody<PE['body']>(req.body, schema))
      .then((body) => {
        req.body = body;
        return handler(req, res, next);
      }).then((result) => {
        res.status(code).send({
          data: result,
          error: false,
        });
      }).catch((error: BaseException) => {
        logger.e(error);
        const mError = Maybe.fromValue(error);
        const message = mError.map((e) => e.message).value() || 'Something went wrong';
        const name = mError.map((e) => e.name).value() || 'InternalServerError';
        const statusCode = mError.map((e) => e.statusCode).value() || 500;
        res.status(statusCode).send({
          error: true,
          message,
          name,
        });
      });
    };
    return wrapped;
  }
}
