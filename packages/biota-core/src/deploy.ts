import { deploy as buiderDeploy } from '@biota/builder';
import { factory as schema } from '@biota/schema';
import { factory as error } from '@biota/error';
import { factory as helpers } from '@biota/helpers';
import { factory as constants } from '@biota/constants';
import * as factory from './factory';

export async function deploy(secret: string, options: any = {}) {
  return buiderDeploy(secret, [factory, helpers, schema, error, constants], options);
}
