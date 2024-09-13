import { Controller, Get, Req } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ){}

  @Get('/type')
  async getReportTypes(@Req() req: OGRequest){
    const reportTypes = await this.reportService.getReportTypes(req.lang);

    return {
      success: true,
      result: reportTypes
    }
  }
}
