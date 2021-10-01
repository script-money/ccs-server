import { Inject, Provide } from '@midwayjs/decorator';
import { ActivitiesGetDTO } from '../dto/activity';
import {
  IActivityService,
  IGetActivitiesResponse,
} from '../interface/activity';
import { getActivities } from '../orm/activity';
import httpStatus from 'http-status';
import { Context } from 'egg';

@Provide()
export class ActivityService implements IActivityService {
  @Inject()
  ctx: Context;

  async queryMany(options: ActivitiesGetDTO): Promise<IGetActivitiesResponse> {
    try {
      const activities = await getActivities(options);
      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errorCode: httpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: 'unknow error when get activity',
        showType: 2,
      };
    }
  }
}
