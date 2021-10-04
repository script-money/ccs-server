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
      const { limit, offset, type, canVote, canJoin } = options;
      const [activities, total] = await getActivities({
        limit: limit === undefined ? 10 : Number(limit),
        offset: offset === undefined ? 0 : Number(offset),
        type,
        canVote: canVote === undefined ? undefined : canVote === 'true',
        canJoin: canJoin === undefined ? undefined : canJoin === 'true',
      });

      return {
        success: true,
        data: activities,
        total,
      };
    } catch (error) {
      console.warn(error);
      return {
        success: false,
        data: error,
        total: 0,
        errorCode: httpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: 'unknow error when get activity',
        showType: 2,
      };
    }
  }
}
