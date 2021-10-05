import {
  Inject,
  Controller,
  Provide,
  Get,
  ALL,
  Query,
  Validate,
} from '@midwayjs/decorator';
import { Context } from 'egg';

import {
  IActivityService,
  IGetActivitiesResponse,
  IGetActivityResponse,
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

  @Get('/:id')
  async getActivity(): Promise<IGetActivityResponse> {
    const result = await this.activityService.queryOne(this.ctx.params.id);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }

  @Get('/')
  @Validate()
  async getActivities(
    @Query(ALL) queryOptions: ActivitiesGetDTO
  ): Promise<IGetActivitiesResponse> {
    const result = await this.activityService.queryMany(queryOptions);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }
}
