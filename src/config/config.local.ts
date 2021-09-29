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

fcl.config().put('accessNode.api', config.httpUri);

export const activityContract = config.contracts['Project.ActivityContract'];
export const ballotContract = config.contracts['Project.BallotContract'];
export const CCSToken = config.contracts['Project.CCSToken'];
export const Memorials = config.contracts['Project.Memorials'];
export const maxQueryBlock = 250;
