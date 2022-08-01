import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Config } from './models/config';

export async function validateConfig(object: any): Promise<Config> {
  //@ts-ignore
  const config = plainToClass(Config, object) as Config;
  await validateOrReject(config);
  return config;
}
