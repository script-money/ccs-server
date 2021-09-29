import { Inject, Provide } from '@midwayjs/decorator';
import * as fcl from '@onflow/fcl';
import { ec as EC } from 'elliptic';
import { SHA3 } from 'sha3';
const ec: EC = new EC('p256');
import { Event, GetEventsOptions } from '../interface/flow';
import { BlockCursorService } from './blockCursor';

@Provide()
export class FlowService {
  private readonly minterFlowAddress: string;
  private readonly minterPrivateKeyHex: string;
  private readonly minterAccountIndex: string | number;

  @Inject()
  blockCursorService: BlockCursorService;

  authorizeMinter() {
    return async (account: any = {}) => {
      const user = await this.getAccount(this.minterFlowAddress);
      const key = user.keys[this.minterAccountIndex];

      const sign = this.signWithKey;
      const pk = this.minterPrivateKeyHex;

      return {
        ...account,
        tempId: `${user.address}-${key.index}`,
        addr: fcl.sansPrefix(user.address),
        keyId: Number(key.index),
        signingFunction: signable => {
          return {
            addr: fcl.withPrefix(user.address),
            keyId: Number(key.index),
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

  private signWithKey = (privateKey: string, msg: string) => {
    const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
    const sig = key.sign(this.hashMsg(msg));
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, 'be', n);
    const s = sig.s.toArrayLike(Buffer, 'be', n);
    return Buffer.concat([r, s]).toString('hex');
  };

  private hashMsg(msg: string) {
    const sha = new SHA3(256);
    sha.update(Buffer.from(msg, 'hex'));
    return sha.digest();
  }

  async sendTx({
    transaction,
    args,
    proposer,
    authorizations,
    payer,
  }): Promise<any> {
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
    return await fcl.tx(response).onceSealed();
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

    const events: Event[] = await fcl
      .send([
        fcl.getEventsAtBlockHeightRange(
          key,
          savedCursor.currentHeight + 1,
          endBlock
        ),
      ])
      .then(fcl.decode);
    await this.blockCursorService.updateBlockCursorById(
      savedCursor.id,
      endBlock
    );
    return events;
  }
}
