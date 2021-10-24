# ccs-server

The server side is responsible for

1. synchronizing event data on the chain
2. performing some complex calculations
3. sending transactions with admin signatures
4. Provide data interface for front-end
5. Manage some business data that does not need to be on the chain

## prepare

1. copy .cdc files from cadence folder `rsync -av --progress ../cadence/ cadence/ --exclude .git/ --exclude tests/`
2. launch postgres `docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ccs -p 5432:5432 -d postgres`
3. run `cd src/prisma && cp .env.example .env` then modify .env to connect postgres
4. `npx prisma migrate dev --name initial` to generate prisma client files
5. launch a redis at `redis://127.0.0.1:6379`

## how to run local development environment

1. in ccs-dappstarter folder, use `yarn dev` run Flow environment
2. use `npx prisma migrate reset` to initiate postgres (if need)
3. when Flow environment prepared, use `yarn dev` in ccs-server to launch server
4. use `npx prisma studio` to check database in GUI (if need)
5. use `npx kill-port 7001` to close server (if need)

## how to test ORM

test ORM with `yarn test:db`
