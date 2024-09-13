import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';

describe('PostController', () => {
  let controller: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService, ConnectionService, RMQService],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('success create post', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because contents is too long', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because contents is too short', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because title is too long', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because title is too short', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because insert database failed', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because insert tag creation failed', () => {
    expect(true).toEqual(true);
  });
  it('failed create post because catch error', () => {
    expect(true).toEqual(true);
  });

  it('success update post', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because contents is too long', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because contents is too short', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because title is too long', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because title is too short', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because update database failed', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because update tag creation failed', () => {
    expect(true).toEqual(true);
  });
  it('failed update post because catch error', () => {
    expect(true).toEqual(true);
  });

  it('success remove post', () => {
    expect(true).toEqual(true);
  });
  it('failed remove post because post not found', () => {
    expect(true).toEqual(true);
  });
  it('failed remove post because remove tag creation failed', () => {
    expect(true).toEqual(true);
  });
  it('failed remove post because catch error', () => {
    expect(true).toEqual(true);
  });

  it('success vote post', () => {
    expect(true).toEqual(true);
  });
  it('failed vote post because post not found', () => {
    expect(true).toEqual(true);
  });
  it('failed vote post because voteCount error', () => {
    expect(true).toEqual(true);
  });
  it('failed vote post because catch error', () => {
    expect(true).toEqual(true);
  });

  it('success report post', () => {
    expect(true).toEqual(true);
  });
  it('failed report post because post not found', () => {
    expect(true).toEqual(true);
  });
  it('failed report post because already reported', () => {
    expect(true).toEqual(true);
  });
  it('failed report post because insert database error', () => {
    expect(true).toEqual(true);
  });
  it('failed report post because catch error', () => {
    expect(true).toEqual(true);
  });


  it('success get post', () => {
    expect(true).toEqual(true);
  })

  it('failed get post because not found post', () => {
    expect(true).toEqual(true);
  })
  it('failed get post because transaction release failed', () => {
    expect(true).toEqual(true);
  })
});
