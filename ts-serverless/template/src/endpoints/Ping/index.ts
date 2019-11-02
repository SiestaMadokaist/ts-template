import { PostEndpoint } from '../../helper/types';
import { PostHandler } from '../../helper/server';
import { logger } from '../../helper/logger';
import { JoiGeneric, joiGeneric, Joi } from '../../helper/utility';

namespace Ping {

  export interface Interface extends PostEndpoint {
    path: 'ping';
    body: {
      ping: 'pong';
      pong?: 'ping';
    };
    response: {
      pong: 'ping';
    };
  }

  export const Schema = joiGeneric<Interface['body']>().keys({
    ping: Joi.string().required(),
    pong: Joi.string().optional().valid('ping').default('ping'),
  });

  export const Handler: PostHandler<Interface> = async (req) => {
    return { pong: 'ping' };
  };

}
export default Ping;
