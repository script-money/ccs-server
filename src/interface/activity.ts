import { ActivitiesGetDTO } from '../dto/activity';
// eslint-disable-next-line node/no-unpublished-import
import { ActivityType } from '../prisma/client';
import { Address, UFix64, UInt64 } from './flow';
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
  limit?: number;
  offset?: number;
  type?: ActivityType;
  canVote?: boolean;
  canJoin?: boolean;
}

// interface IQueryOneOptions {
//   id: number;
// }

// interface IModifyOptions {
//   id: number;
//   message: string;
//   signature: compositeSignature;
// }

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
  data: any;
  total: number;
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

  // /**
  //  * allow creater change activity's important data
  //  * @param options id, message, compositeSignature
  //  */
  // update(options: IModifyOptions): Promise<Activity>;

  // /**
  //  * two condition cause activity close.
  //  * 1. One day after creation.
  //  * 2. negative voting power exceeds threshold
  //  * 3. close by admin manually
  //  * @param options id
  //  */
  // close(options: ICloseOptionsFromTask): Promise<Activity>;
}
