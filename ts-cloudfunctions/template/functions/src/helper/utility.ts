import joi from 'joi';
import joiToSwagger from 'joi-to-swagger';
import { ParamsMismatchSchema } from './errors';
export const Joi = joi;

export type NR<X> = X extends number ? number :
X extends string ? string :
X extends boolean ? boolean :
X extends object ? Required<{
  [K in keyof X]: NR<X[K]>
}> : never;

export interface IAnyX { '__@type'?: 'IObjectX'; }
export interface JoiGeneric<X> extends joi.ObjectSchema {
  keys(params: { [K in keyof NR<X>]: JoiOf<NR<X>[K]>}): this;
}

export type JoiOf<X> = X extends string ? joi.StringSchema :
X extends number ? joi.NumberSchema :
X extends boolean ? joi.BooleanSchema :
X extends Date ? joi.DateSchema :
X extends IAnyX ? joi.AnySchema :
X extends object ? JoiGeneric<X> :
never;

export function joiGeneric<X>(strict: boolean = false): JoiGeneric<X> {
  if (!strict) {
    return joi.object().unknown();
  } else {
    return joi.object();
  }
}

export function joiVerify<X>(item: X, schema: JoiOf<X>): joi.ValidationResult<X> {
  return joi.validate(item, schema);
}

export async function parseBody<T>(thing: undefined | string | T, schema: JoiOf<T>): Promise<Required<T>> {
  const s = joiToSwagger(schema);
  if (!thing) { throw new ParamsMismatchSchema('expected a string, got undefined instead', s.swagger); }
  const parsed = (typeof thing === 'string') ? JSON.parse(thing) : thing;
  const validated = await joiVerify<Required<T>>(parsed, schema).catch((error) => {
    throw new ParamsMismatchSchema(error.message, s.swagger);
  });
  return validated;
}
