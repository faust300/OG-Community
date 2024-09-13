import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { ReferralProgram } from './entities/trade.entity';
import SQL from 'sql-template-strings';

@Injectable()
export class TradeService {
  constructor(private readonly connectionService: ConnectionService) {}

  async getReferralPrograms(): Promise<ReferralProgram[]> {
    const referralPrograms =
      await this.connectionService.connectionPool.readerQuery<
        ReferralProgram[]
      >(
        SQL`
        SELECT 

          name,
          logoPath,
          logoBackgroundColor,
          title,
          description,
          code,
          btnLabel,
          externalLink,
          disabled,
          createdAt,
          updatedAt
        
        FROM 
        
          ReferralProgram 
          
        WHERE 
        
          deletedAt IS NULL;`,
      );
    return referralPrograms.map((referralProgram) => {
      referralProgram.disabled = Boolean(referralProgram.disabled);
      return referralProgram;
    });
  }
}
