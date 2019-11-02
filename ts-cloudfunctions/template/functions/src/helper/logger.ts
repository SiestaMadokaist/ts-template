import { Reject, Resolve } from '@cryptoket/ts-promise-helper';
import { env } from './env';

class Logger {

  d(message: object): void {
    this.write('debug', message);
  }
  debug(message: object): void {
    this.d(message);
  }

  e(error?: Error): void {
    try {
      if (!error) {
        return this.write('error', { message: 'undefined error' });
      }
      const { message, stack, name } = error;
      return this.write('error', { message, stack, name });
    } catch (error2) {
      return this.write('error', { error, error2 });
    }
  }

  error(error?: Error): void {
    this.e(error);
  }

  l(message: object): void {
    this.write('log', message);
  }

  log(message: object): void {
    this.l(message);
  }

  stringify(obj: object): string {
    if (env.LAMBDA_ENV === 'true') {
      /** aws lambda with layer logs neater for JSON.stringify without newline */
      return JSON.stringify(obj);
    } else {
      return JSON.stringify(obj, null, 2);
    }
  }

  w(message: object): void {
    this.write('warn', message);
  }

  private write(level: 'debug' | 'log' | 'warn' | 'error', message: object): void {
    try {
      // tslint:disable-next-line:no-console
      console.log(this.stringify({ message, level }));
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log({ message, level });
    }
  }

}

export const logger = new Logger();
