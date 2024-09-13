import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import SQL, { SQLStatement } from "sql-template-strings";
import { ReportType } from './entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    private readonly connectionService: ConnectionService
  ){}

  async getReportTypes(lang: string){
    const types = await this.connectionService.connectionPool.readerQuery<ReportType[]>(`
      SELECT
        id AS reportTypeId,
        i18n->>'$.${lang}' AS reportType
      FROM
        ReportType
    `, []);

    return types;
  }
}
