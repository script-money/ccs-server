// eslint-disable-next-line node/no-unpublished-import
import { User } from '../prisma/client';
import { IResponse } from './utils';

export interface IGetUserResponse extends IResponse {
  data: User | null;
}

export interface IUserService {
  queryOne(address: string): Promise<IGetUserResponse>;
}
