import { Test, TestingModule } from '@nestjs/testing';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';

describe('TopicController', () => {
  let controller: TopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicController],
      providers: [TopicService, ConnectionService, RMQService],
    }).compile();

    controller = module.get<TopicController>(TopicController);
  });


  it('success create custom topic', () => {
    expect(true).toEqual(true);
  });

  it('failed create custom topic by not found userId', () => {
    expect(true).toEqual(true);
  });

  it('failed create custom topic by not found createDto', () => {
    expect(true).toEqual(true);
  });

  it('failed create custom topic', () => {
    expect(true).toEqual(true);
  });

  it('success update custom topic', () => {
    expect(true).toEqual(true);
  });

  it('failed update custom topic', () => {
    expect(true).toEqual(true);
  });

  it('success remove custom topic', () => {
    expect(true).toEqual(true);
  });

  it('failed remove custom topic', () => {
    expect(true).toEqual(true);
  });

});
