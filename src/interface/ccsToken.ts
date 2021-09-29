import { Address, UFix64 } from './flow';

export interface ITokenAirdropFromEvent {
  receiver: Address;
  amount: UFix64;
}

export interface IGetTokenChangeRecordsOptions {
  user?: Address;
  skip?: number;
  take?: number;
}
