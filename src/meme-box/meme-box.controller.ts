import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MemeBoxService } from './meme-box.service';

@Controller('meme-box')
export class MemeBoxController {
  constructor(private readonly memeBoxService: MemeBoxService) {}

  @Get()
  async getMemeBox() {
    const memeBox = await this.memeBoxService.getMemeBoxCategories();

    return {
      success: memeBox.length > 0,
      result: memeBox
    };
  }
}
