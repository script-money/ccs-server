import { Config, Inject, Provide } from '@midwayjs/decorator';
import { Context } from 'egg';
import httpStatus from 'http-status';
import {
  ICCSTokenService,
  IRequestFreeTokenResponse,
} from '../interface/ccsToken';
import { getHistory, addRecord } from '../orm/ccsToken';
import { FlowService } from './flow';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { Address } from '../interface/flow';

const FungibleTokenPath = '"../../contracts/FungibleToken.cdc"';
const CCSTokenPath = '"../../contracts/CCSToken.cdc"';

export const toUFix64 = (value: number) => value.toFixed(8);

@Provide()
export class ccsTokenService implements ICCSTokenService {
  @Inject()
  ctx: Context;

  @Inject()
  flowService: FlowService;

  @Config('fungibleToken')
  fungibleToken: Address;

  @Config('CCSToken')
  CCSToken: Address;

  @Config('facuetAmount')
  facuetAmount: number;

  async requestFree(addr: string): Promise<IRequestFreeTokenResponse> {
    try {
      const result = await getHistory(addr);
      if (result !== null) {
        return {
          success: true,
          data: result,
          errorCode: httpStatus.ACCEPTED,
          errorMessage: 'user already request free tokens',
          showType: 1,
        };
      }

      // sign to send transaction
      const authorization = this.flowService.authorizeMinter();
      console.log(authorization);

      const transaction = readFileSync(
        join(
          __dirname,
          '../../cadence/transactions/CCSToken/mint_tokens_and_distribute.cdc'
        ),
        'utf8'
      )
        .replace(FungibleTokenPath, fcl.withPrefix(this.fungibleToken))
        .replace(CCSTokenPath, fcl.withPrefix(this.CCSToken));

      const txResult = await this.flowService.sendTx({
        transaction,
        args: [
          fcl.arg(
            [{ key: addr, value: toUFix64(this.facuetAmount) }],
            t.Dictionary({ key: t.Address, value: t.UFix64 })
          ),
        ],
        authorizations: [authorization],
        payer: authorization,
        proposer: authorization,
      });

      if (txResult) {
        await addRecord(addr);
        return {
          success: true,
          data: null,
        };
      }
    } catch (error) {
      console.warn(error);
      return {
        success: false,
        data: null,
      };
    }
  }
}
