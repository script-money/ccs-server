import moment from 'moment';
import { ActivitiesGetDTO } from '../dto/activity';
// eslint-disable-next-line node/no-unpublished-import
import { Activity, ActivityType } from '../prisma/client';
import { Address, compositeSignature, UFix64, UInt64 } from './flow';
import { IResponse } from './utils';

export interface ICreateOptionsFromEvent {
  id: UInt64;
  title: string;
  metadata: string;
  creator: Address;
}

export interface IVotedOptionsFromEvent {
  id: UInt64;
  voter: Address;
  isUpVote: boolean;
}

export interface IClosedOptionsFromEvent {
  id: UInt64;
  bonus: UFix64;
  mintPositive: boolean;
}

export interface IConsumptionUpdatedFromEvent {
  newPrice: UFix64;
}

export interface IRewardParameterUpdatedFromEvent {
  newParams: RewardParameter;
}

export type RewardParameter = {
  maxRatio: UFix64;
  minRatio: UFix64;
  // if get average vote compare past activities, can get averageRatio * createConsumption CCS reward
  averageRatio: UFix64;
  asymmetry: UFix64;
};

export interface IQueryManyOptions {
  limit?: number | string;
  offset?: number | string;
  type?: ActivityType;
  canVote?: boolean;
  address?: Address;
  canJoin?: boolean;
  createBy?: Address;
}

export interface IModifyOptions {
  id: number;
  message: string;
  compositeSignatures: compositeSignature[];
}

export interface IModifyMetadataOptions {
  content?: string;
  startDate?: moment.Moment;
  endDate?: moment.Moment;
  source?: string;
}

export enum userValidActivityTypeEnum {
  'Interact',
  'Form',
  'Vote',
  'Test',
  'Node',
  'Learn',
  'Create',
  'Develop',
  'Whitelist',
  'IXO',
  'LuckDraw',
  'Register',
}

export interface IGetActivitiesResponse extends IResponse {
  data: Activity[];
  total: number;
}

export interface IGetActivityResponse extends IResponse {
  data: Activity | null;
}

export interface ICloseOptionsFromTask {
  id: number;
}

export interface IActivityService {
  // /**
  //  * query one activity, use for controller
  //  * @param options id
  //  */
  // query(options: IQueryOneOptions): Promise<Activity>;

  /**
   * query activities base query params, use for controller
   * @param options queryParams
   */
  queryMany(options: ActivitiesGetDTO): Promise<IGetActivitiesResponse>;

  /**
   * query one activity by id, use for controller
   * @param options activity id
   */
  queryOne(id: number): Promise<IGetActivityResponse>;

  /**
   * allow creater change activity's metadata
   * @param options id, message, compositeSignature
   */
  updateOne(options: IModifyOptions): Promise<IGetActivityResponse>;

  // /**
  //  * two condition cause activity close.
  //  * 1. One day after creation.
  //  * 2. negative voting power exceeds threshold
  //  * 3. close by admin manually
  //  * @param options id
  //  */
  // close(options: ICloseOptionsFromTask): Promise<Activity>;
}
