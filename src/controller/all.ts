import {
  Inject,
  Controller,
  Provide,
  Get,
  ALL,
  Query,
  Validate,
  Put,
  Param,
} from '@midwayjs/decorator';
import { Context } from 'egg';

import {
  IActivityService,
  IGetActivitiesResponse,
  IGetActivityResponse,
  IModifyOptions,
} from '../interface/activity';
import { ActivitiesGetDTO } from '../dto/activity';
import httpStatus from 'http-status';
import { IGetUserResponse, IUserService } from '../interface/user';

@Provide()
@Controller('/api')
export class ActivityController {
  @Inject()
  activityService: IActivityService;

  @Inject()
  ctx: Context;

  @Inject()
  userService: IUserService;

  // user
  @Get('/user/:address')
  async getUser(@Param('address') address: string): Promise<IGetUserResponse> {
    const result = await this.userService.queryOne(address);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }

  // activity
  @Get('/activity/:id')
  async getActivity(): Promise<IGetActivityResponse> {
    const result = await this.activityService.queryOne(this.ctx.params.id);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }

  @Get('/activity')
  @Validate()
  async getActivities(
    @Query(ALL) queryOptions: ActivitiesGetDTO
  ): Promise<IGetActivitiesResponse> {
    const result = await this.activityService.queryMany(queryOptions);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }

  @Put('/activity')
  async updateActivity(
    @Query(ALL) queryOptions: IModifyOptions
  ): Promise<IGetActivityResponse> {
    const result = await this.activityService.updateOne(queryOptions);
    this.ctx.status = result.success ? httpStatus.OK : result.errorCode;
    return result;
  }
}