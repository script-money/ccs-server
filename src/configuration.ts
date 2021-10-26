import { App, Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayApplication } from '@midwayjs/core';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as task from '@midwayjs/task';
// eslint-disable-next-line node/no-unpublished-import
import { PrismaClient } from './prisma/client';
import { join } from 'path';

// Prisma require env variables
dotenv.config();

const client = new PrismaClient();

@Configuration({
  imports: [task],
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
