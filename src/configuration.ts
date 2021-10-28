import { App, Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayApplication } from '@midwayjs/core';
import chalk from 'chalk';
import * as task from '@midwayjs/task';
// eslint-disable-next-line node/no-unpublished-import
import { PrismaClient } from './prisma/client';
import { join } from 'path';
import * as redis from '@midwayjs/redis';

const client = new PrismaClient();

@Configuration({
  imports: [task, redis],
  importConfigs: [
    join(__dirname, './config/config.default'),
    join(__dirname, './config/config.local'),
    join(__dirname, './config/config.testnet'),
  ],
})
export class ContainerConfiguration implements ILifeCycle {
  @App()
  app: IMidwayApplication;

  async onReady(): Promise<void> {
    client.$connect();
    console.log(chalk.greenBright('[ Prisma ] Prisma Client Connected'));
    this.app.getApplicationContext().registerObject('prisma', client);
    console.log(chalk.greenBright('[ Prisma ] Prisma Client Injected'));
  }

  async onStop(): Promise<void> {
    client.$disconnect();
  }
}
