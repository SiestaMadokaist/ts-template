import { PostEndpoint } from '../../helper/types';
import { PostHandler } from '../../helper/server';
import { logger } from '../../helper/logger';
import { JoiGeneric, joiGeneric, Joi } from '../../helper/utility';

namespace Ping {

  /**
   * consider the property body of the interface
   * to be the one that you would actually expect can be handled.
   * for example:
   * if your joi schema set the default value of the body
   * then put those field as required
   * even though the frontend might not actually sending.
   */
  export interface Interface extends PostEndpoint {
    path: 'ping';
    body: {
      ping: 'pong';
      pong: 'ping';
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
    return { pong: req.body.pong as 'ping' };
  };

}
export default Ping;
