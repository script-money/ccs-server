// eslint-disable-next-line node/no-unpublished-import
import { Activity, ActivityType } from '../prisma/client';
import { Address, compositeSignature, UFix64, UInt64 } from './flow';

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

interface IQueryManyOptions {
  type?: ActivityType;
  isClose?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  addressHasVoted?: Address;
  skip?: number;
  take?: number;
}

interface IQueryOneOptions {
  id: number;
}

interface IModifyOptions {
  id: number;
  message: string;
  signature: compositeSignature;
}

export interface ICloseOptionsFromTask {
  id: number;
}

export interface IActivityService {
  /**
   * activities create from emit events
   * @param options event data
   */
  create(options: ICreateOptionsFromEvent): Promise<Activity>;

  /**
   * query one activity, use for controller
   * @param options id
   */
  query(options: IQueryOneOptions): Promise<Activity>;

  /**
   * query activities base query params, use for controller
   * @param options queryParams
   */
  queryMany(options: IQueryManyOptions): Promise<Activity[]>;

  /**
   * allow creater change activity's important data
   * @param options id, message, compositeSignature
   */
  update(options: IModifyOptions): Promise<Activity>;

  /**
   * two condition cause activity close.
   * 1. One day after creation.
   * 2. negative voting power exceeds threshold
   * 3. close by admin manually
   * @param options id
   */
  close(options: ICloseOptionsFromTask): Promise<Activity>;
}
