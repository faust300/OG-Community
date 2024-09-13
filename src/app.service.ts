import { Injectable } from '@nestjs/common';
import { ConnectionService } from './extensions/services/connection.service';
import SQL from 'sql-template-strings';

@Injectable()
export class AppService {
  constructor(private readonly cs: ConnectionService) {}

  postBody(body: any) {
    try {
      this.cs.connectionPool.writerQuery(
        SQL`INSERT INTO TempTextSaver (body) VALUES (${JSON.stringify(body)})`,
      );
    } catch (e) {
      this.cs.connectionPool.writerQuery(
        SQL`INSERT INTO TempTextSaver (body) VALUES (${body.toString()})`,
      );
    }
  }
}
