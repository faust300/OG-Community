import { Injectable } from '@nestjs/common';
import { OGException } from 'src/extensions/exception/exception.filter';
import { ConnectionService } from 'src/extensions/services/connection.service';
import SQL from 'sql-template-strings';
import { MemeBox } from './entities/meme-box.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemeBoxDTO } from './dto/meme-box.dto';

@Injectable()
export class MemeBoxService {
  constructor(
    private readonly connectionService: ConnectionService,

    @InjectRepository(MemeBox)
    private readonly memeBoxRepository: Repository<MemeBox>
  ) {}

  async getMemeBoxCategories(): Promise<MemeBoxDTO[]> {
    try {
      const queryObj = await this.memeBoxRepository.find();

      const memeBox = queryObj.map(item => item.convertMemeBoxDTO(item));

      return memeBox ?? [];
    } catch (e) {
      throw new OGException({
        errorCode: -60000,
        errorMessage: "MemeBox Load Failed"
      }, 500);
    }
  }
}
