import { Module } from '@nestjs/common';
import { MemeBoxService } from './meme-box.service';
import { MemeBoxController } from './meme-box.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemeBox } from './entities/meme-box.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemeBox])],
  controllers: [MemeBoxController],
  providers: [
    ConnectionService,
    MemeBoxService
  ]
})
export class MemeBoxModule {}
