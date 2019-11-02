import joi from 'joi';
export enum ST {
  LAMBDA_ENV = 'LAMBDA_ENV',
}

export enum NT {}

export type PaginationQuery<T = unknown> = T & { before?: Date, limit?: number };
export type STK = (keyof typeof ST);
export type NTK = (keyof typeof NT);
export type PhantomString<T extends ST> = string & { '__@phantomId'?: T, '__@phantomType'?: 'PhantomString' };
export type PhantomNumber<T extends NT> = number & { '__@phantomId'?: T, '__@phantomType'?: 'PHantomNumber' };
export type NestedRequired<T> = Required<{ [K in keyof T]: NestedRequired<T[K]> }>;

export interface PostEndpoint {
  method: 'post';
  path: string;
  body: unknown;
  response: unknown;
}
