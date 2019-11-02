import mocha from 'mocha';
import { expect } from 'chai';
import { ping } from './app';
import { logger } from './helper/logger';
import Ping from './endpoints/Ping';
import { LambdaResponse } from './helper/lambda';

describe('lambda:ping', () => {
  it('return perfectly', async () => {
    const { data } = await ping({ body: {
      ping: 'pong',
    }});
    const parsed: LambdaResponse<Ping.Interface> = JSON.parse(data);
    expect(parsed.data.pong).to.equal('ping');
  });
});
