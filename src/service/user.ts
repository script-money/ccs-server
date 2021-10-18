import { Inject, Provide } from '@midwayjs/decorator';
import { IGetUserResponse, IUserService } from '../interface/user';
import { Context } from 'egg';
import { getUser } from '../orm/user';
import httpStatus from 'http-status';

@Provide()
export class UserService implements IUserService {
  @Inject()
  ctx: Context;

  async queryOne(address: string): Promise<IGetUserResponse> {
    try {
      const result = await getUser(address);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.warn(error);
      return {
        success: false,
        data: null,
        errorCode: httpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: 'unknow error when get single user',
        showType: 2,
      };
    }
  }
}
