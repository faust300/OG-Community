import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyzeService {
  async writeRecord(params: any): Promise<any> {
    return 1;
  }
}