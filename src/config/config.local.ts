import * as fcl from '@onflow/fcl';
import config from './dapp-config.json';

export const taskConfig = {
  redis: 'redis://127.0.0.1:6379',
  prefix: 'midway-task',
  defaultJobOptions: {
    repeat: {
      tz: 'Asia/Shanghai',
    },
  },
};

export const redis = {
  client: {
    port: 6379, // Redis port
    host: '127.0.0.1', // Redis host
    password: '',
    db: 1,
  },
};

fcl.config().put('accessNode.api', config.httpUri);

export const fungibleToken = config.contracts['Flow.FungibleToken'];
export const activityContract = config.contracts['Project.ActivityContract'];
export const ballotContract = config.contracts['Project.BallotContract'];
export const ccsToken = config.contracts['Project.CCSToken'];
export const memorials = config.contracts['Project.Memorials'];
export const nonFungibleToken = config.contracts['Flow.NonFungibleToken'];

export const shortQueryBlock = 20; // fit every 20 seconds
export const midRangeQueryBlock = 60; // fit greater than 1 minute
export const maxRangeQueryBlock = 250;
export const closeActivityIntervalMinutes = 3;
export const startHeight = 0;

export const minterFlowAddress = config.wallets[0].address;
export const minterKeys = [config.wallets[0].keys[0]];

export const facuetAmount = 1000;
