import { Inject, Provide } from '@midwayjs/decorator';
import { getMemorialsByActivity, getMemorialsByUser } from '../orm/momerials';
import httpStatus from 'http-status';
import { Context } from 'egg';
import { FlowService } from './flow';
import {
  IGetMemorialsOptions,
  IGetMemorialsResponse,
  IMemorialsService,
} from '../interface/momerials';

@Provide()
export class MemorialsService implements IMemorialsService {
  @Inject()
  ctx: Context;

  @Inject()
  flowService: FlowService;

  async queryMany(
    option: IGetMemorialsOptions
  ): Promise<IGetMemorialsResponse> {
    if (option.userAddress !== undefined && option.activityId === undefined) {
      try {
        const memorialsArray = await getMemorialsByUser(option.userAddress);
        return {
          success: true,
          data: memorialsArray,
        };
      } catch (error) {
        console.warn(error);
        return {
          success: false,
          data: [],
          errorCode: httpStatus.INTERNAL_SERVER_ERROR,
          errorMessage: 'unknow error when get memorials by address',
          showType: 2,
        };
      }
    } else if (
      option.userAddress === undefined &&
      option.activityId !== undefined
    ) {
      try {
        const memorialsArray = await getMemorialsByActivity(option.activityId);
        return {
          success: true,
          data: memorialsArray,
        };
      } catch (error) {
        console.warn(error);
        return {
          success: false,
          data: [],
          errorCode: httpStatus.INTERNAL_SERVER_ERROR,
          errorMessage: 'unknow error when get memorials by activityID',
          showType: 2,
        };
      }
    } else {
      return {
        success: true,
        data: [],
        errorCode: httpStatus.NOT_ACCEPTABLE,
        errorMessage: 'userAddress and activityId can not coexist',
        showType: 1,
      };
    }
  }
}
