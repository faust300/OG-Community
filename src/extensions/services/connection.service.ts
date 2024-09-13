import { Injectable, OnModuleInit } from '@nestjs/common';
import ConnectionPool from 'libs-connection-pool';

@Injectable()
export class ConnectionService implements OnModuleInit {
  public connectionPool: ConnectionPool;

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      this.connectionPool = new ConnectionPool({
        host: String(process.env.TEST_DATABASE_HOST),
        writerHost: String(process.env.TEST_DATABASE_HOST),
        readerHost: String(process.env.TEST_DATABASE_RO_HOST),
        user: String(process.env.TEST_DATABASE_USER),
        password: String(process.env.TEST_DATABASE_PASS),
        database: String(process.env.TEST_DATABASE_NAME),
      });
    } else {
      this.connectionPool = new ConnectionPool({
        host: String(process.env.DATABASE_HOST),
        writerHost: String(process.env.DATABASE_HOST),
        readerHost: String(process.env.DATABASE_RO_HOST),
        user: String(process.env.DATABASE_USER),
        password: String(process.env.DATABASE_PASS),
        database: String(process.env.DATABASE_NAME),
      });
    }
  }
}