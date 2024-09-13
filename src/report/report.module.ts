import { Module } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  controllers: [ReportController],
  providers: [
    ReportService,
    ConnectionService,
  ]
})
export class ReportModule {}
