import { Body, Controller, Get, Post, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect()
  getHello() {
    return {
      url: 'https://og.xyz',
    };
  }

  @Post('/body')
  postBody(@Body() body: any) {
    this.appService.postBody(body);
    return true;
  }
}
