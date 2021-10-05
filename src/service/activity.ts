import { Inject, Provide } from '@midwayjs/decorator';
import { ActivitiesGetDTO } from '../dto/activity';
import {
  IActivityService,
  IGetActivitiesResponse,
  IGetActivityResponse,
} from '../interface/activity';
import { getActivities, getActivity } from '../orm/activity';
import httpStatus from 'http-status';
import { Context } from 'egg';

@Provide()
export class ActivityService implements IActivityService {
  @Inject()
  ctx: Context;

  async queryMany(options: ActivitiesGetDTO): Promise<IGetActivitiesResponse> {
    try {
      const { limit, offset, type, canVote, canJoin, createBy } = options;
      const [activities, total] = await getActivities({
        limit: limit === undefined ? 10 : Number(limit),
        offset: offset === undefined ? 0 : Number(offset),
        type,
        canVote: canVote === undefined ? undefined : canVote === 'true',
        canJoin: canJoin === undefined ? undefined : canJoin === 'true',
        createBy,
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
        data: [],
        total: 0,
        errorCode: httpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: 'unknow error when get activities',
        showType: 2,
      };
    }
  }

  async queryOne(id: number): Promise<IGetActivityResponse> {
    try {
      const result = await getActivity(Number(id));
      if (!result.closed) {
        const { voteResult, ...otherInfo } = result;
        return {
          success: true,
          data: otherInfo,
        };
      } else {
        return {
          success: true,
          data: result,
        };
      }
    } catch (error) {
      console.warn(error);
      return {
        success: false,
        data: null,
        errorCode: httpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: 'unknow error when get single activity',
        showType: 2,
      };
    }
  }
}
