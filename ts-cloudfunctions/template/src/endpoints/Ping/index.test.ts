import mocha from 'mocha';
import { expect } from 'chai';
import Ping from '.';
import { logger } from '../../helper/logger';

describe('ping', () => {
  it('return pong: ping', async () => {
    const resp = await Ping.Handler({ body: { ping: 'pong'} });
    expect(resp.pong).to.eq('ping');
  });
});
