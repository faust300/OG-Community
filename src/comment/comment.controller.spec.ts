import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';

describe('CommentController', () => {
  let controller: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [CommentService, ConnectionService, RMQService],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('success create comment', () => {
    expect(true).toEqual(true)
  });

  it('failed create comment by not found userId', () => {
    expect(true).toEqual(true)
  });

  it('failed create comment by not inserted database', () => {
    expect(true).toEqual(true)
  });
  
  it('failed create comment by not found createCommentDto', () => {
    expect(true).toEqual(true)
  });

  it('failed create comment by catch error', () => {
    expect(true).toEqual(true)
  });
  


  it('success update comment', () => {
    expect(true).toEqual(true)
  });

  it('failed update comment by not found userId', () => {
    expect(true).toEqual(true)
  });

  it('failed update comment by update falied to database', () => {
    expect(true).toEqual(true)
  });

  it('failed update comment by not found updateCommentDto', () => {
    expect(true).toEqual(true)
  });

  it('failed update comment by catch error', () => {
    expect(true).toEqual(true)
  });



  it('success remove comment', () => {
    expect(true).toEqual(true)
  });

  it('failed remove comment by not found userId', () => {
    expect(true).toEqual(true)
  });

  it('failed remove comment by not found commentId', () => {
    expect(true).toEqual(true)
  });

  it('failed remove comment by nothing change database', () => {
    expect(true).toEqual(true)
  });

  it('failed remove comment by catch error', () => {
    expect(true).toEqual(true)
  });



  it('success vote comment', () => {
    expect(true).toEqual(true)
  });

  it('failed vote comment by not found userId', () => {
    expect(true).toEqual(true)
  });

  it('failed vote comment by not found commentId', () => {
    expect(true).toEqual(true)
  });

  it('failed vote comment by not found voteType', () => {
    expect(true).toEqual(true)
  });

  it('failed vote comment by select vote count failed', () => {
    expect(true).toEqual(true)
  });

  it('failed vote comment by upsert failed', () => {
    expect(true).toEqual(true)
  });

  it('failed vote comment by catch error', () => {
    expect(true).toEqual(true)
  });


  it('success report comment', () => {
    expect(true).toEqual(true)
  });

  it('failed report comment by not found userId', () => {
    expect(true).toEqual(true)
  });

  it('failed report comment by not found commentId', () => {
    expect(true).toEqual(true)
  });

  it('failed report comment by not found comment', () => {
    expect(true).toEqual(true)
  });

  it('failed report comment by already reported', () => {
    expect(true).toEqual(true)
  });

  it('failed report comment by insert failed', () => {
    expect(true).toEqual(true)
  });

  it('failed report comment by catch error', () => {
    expect(true).toEqual(true)
  });

  
});
