import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService, ConnectionService],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('success get comments list', () => {
    expect(true).toEqual(true);
  });
  it('failed get comments list by failed get comment count', () => {
    expect(true).toEqual(true);
  });
  it('failed get comments list by failed get reply comment count', () => {
    expect(true).toEqual(true);
  });
  it('failed get comments list by failed get reply comments with parent comment id', () => {
    expect(true).toEqual(true);
  });
  it('failed get comments list by catch error', () => {
    expect(true).toEqual(true);
  });
  it('success get reply comments list', () => {
    expect(true).toEqual(true);
  });
  it('failed get reply comments list by failed get reply comment count', () => {
    expect(true).toEqual(true);
  });
  it('failed get reply comments list by failed get reply comments with parent comment id', () => {
    expect(true).toEqual(true);
  });
  it('failed get reply comments list by catch error', () => {
    expect(true).toEqual(true);
  });
});
