import {
  Inject,
  Controller,
  Provide,
  Get,
  ALL,
  Query,
} from '@midwayjs/decorator';
import { Context } from 'egg';

import {
  IActivityService,
  IGetActivitiesResponse,
} from '../interface/activity';
import { ActivitiesGetDTO } from '../dto/activity';
import httpStatus from 'http-status';

@Provide()
@Controller('/api/activity')
export class ActivityController {
  @Inject()
  activityService: IActivityService;

  @Inject()
  ctx: Context;

  @Get('/')
  async getActivities(
    @Query(ALL) queryOptions: ActivitiesGetDTO
  ): Promise<IGetActivitiesResponse> {
    const result = await this.activityService.queryMany(queryOptions);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }
}
