import { Config, Inject, Provide } from '@midwayjs/decorator';
import * as fcl from '@onflow/fcl';
import { ec as EC } from 'elliptic';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SHA3 } from 'sha3';
const ec: EC = new EC('p256');
import {
  Address,
  Event,
  flowInteractOptions,
  FlowTxData,
  GetEventsOptions,
  Key,
} from '../interface/flow';
import { BlockCursorService } from './blockCursor';
import { RedisService } from '@midwayjs/redis';

const FungibleTokenPath = '"../../contracts/FungibleToken.cdc"';
const ActivityContractPath = '"../../contracts/ActivityContract.cdc"';
const BallotContractPath = '"../../contracts/BallotContract.cdc"';
const CCSTokenPath = '"../../contracts/CCSToken.cdc"';
const NonFungibleTokenPath = '"../../contracts/NonFungibleToken.cdc"';
const MemorialsPath = '"../../contracts/Memorials.cdc"';

@Provide()
export class FlowService {
  @Inject()
  redisService: RedisService;

  @Config('minterFlowAddress')
  minterFlowAddress: Address;

  @Config('minterKeys')
  minterKeys: Key[];

  @Config('fungibleToken')
  fungibleToken: Address;

  @Config('activityContract')
  activityContract: Address;

  @Config('ballotContract')
  ballotContract: Address;

  @Config('ccsToken')
  ccsToken: Address;

  @Config('memorials')
  memorials: Address;

  @Config('nonFungibleToken')
  nonFungibleToken: Address;

  @Inject()
  blockCursorService: BlockCursorService;

  authorizeMinter(keyToUse: Key) {
    if (keyToUse === undefined) {
      return;
    }
    return async (account: any = {}) => {
      const user = await this.getAccount(this.minterFlowAddress);
      const keyId = keyToUse.keyId;

      const sign = this.signWithKey;
      const pk = keyToUse.privateKey;

      return {
        ...account,
        tempId: `${user.address}-${keyId}`,
        addr: fcl.sansPrefix(user.address),
        keyId: Number(keyId),
        signingFunction: signable => {
          return {
            addr: fcl.withPrefix(user.address),
            keyId: Number(keyId),
            signature: sign(pk, signable.message),
          };
        },
      };
    };
  }

  async getAccount(addr: string) {
    const { account } = await fcl.send([fcl.getAccount(addr)]);
    return account;
  }

  private signWithKey = (privateKey: string, message: string) => {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
    const sha = new SHA3(256);
    sha.update(Buffer.from(message, 'hex'));
    const digest = sha.digest();
    const sig = key.sign(digest);
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, 'be', n);
    const s = sig.s.toArrayLike(Buffer, 'be', n);
    return Buffer.concat([r, s]).toString('hex');
  };

  async sendTx({
    transaction,
    args,
    proposer,
    authorizations,
    payer,
  }): Promise<{ txId: string; data: FlowTxData }> {
    const response = await fcl.send([
      fcl.transaction`
        ${transaction}
      `,
      fcl.args(args),
      fcl.proposer(proposer),
      fcl.authorizations(authorizations),
      fcl.payer(payer),
      fcl.limit(9999),
    ]);
    return { txId: response, data: await fcl.tx(response).onceSealed() };
  }

  async executeScript<T>({ script, args }): Promise<T> {
    const response = await fcl.send([fcl.script`${script}`, fcl.args(args)]);
    return await fcl.decode(response);
  }

  async getLatestBlockHeight(): Promise<number> {
    const block = await fcl.send([fcl.getBlock(true)]);
    const decoded = await fcl.decode(block);
    return decoded.height;
  }

  async sendTxByAdmin(option: flowInteractOptions) {
    const seqNumberValue = await this.redisService.get('seqNumber');
    const seqNumber = seqNumberValue ? Number(seqNumberValue) : 0;
    const keyIndexToUse = seqNumber % this.minterKeys.length;
    console.log('keyIndexToUse:', keyIndexToUse);
    const keyToUse = this.minterKeys[keyIndexToUse];
    await this.redisService.incr('seqNumber');
    const authorization = this.authorizeMinter(keyToUse);

    const transaction = readFileSync(
      join(__dirname, '../../cadence/transactions/', option.path),
      'utf8'
    )
      .replace(FungibleTokenPath, fcl.withPrefix(this.fungibleToken))
      .replace(ActivityContractPath, fcl.withPrefix(this.activityContract))
      .replace(BallotContractPath, fcl.withPrefix(this.ballotContract))
      .replace(CCSTokenPath, fcl.withPrefix(this.ccsToken))
      .replace(NonFungibleTokenPath, fcl.withPrefix(this.nonFungibleToken))
      .replace(MemorialsPath, fcl.withPrefix(this.memorials));

    try {
      const { txId } = await this.sendTx({
        transaction,
        args: option.args,
        authorizations: [authorization],
        payer: authorization,
        proposer: authorization,
      });
      return txId;
    } catch (error) {
      console.log(`Error execute ${option.path}`, error);
      throw new Error(error);
    }
  }

  async getEvents({
    contractAddr,
    contractName,
    eventName,
    endBlock,
  }: GetEventsOptions): Promise<Event[]> {
    const key = `A.${contractAddr}.${contractName}.${eventName}`;
    const savedCursor =
      await this.blockCursorService.findOrCreateLatestBlockCursor(eventName);

    if (savedCursor.currentHeight + 1 >= endBlock) return;

    console.log(
      `query ${key} from ${savedCursor.currentHeight + 1} to ${endBlock}`
    );
    try {
      const events: Event[] = await fcl
        .send([
          fcl.getEventsAtBlockHeightRange(
            key,
            savedCursor.currentHeight + 1,
            endBlock
          ),
        ])
        .then(fcl.decode);
      return events;
    } catch (error) {
      throw new Error(error);
    } finally {
      await this.blockCursorService.updateBlockCursorById(
        savedCursor.id,
        endBlock
      );
    }
  }
}
