import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { AggregateService } from './aggregate.service';

@Controller('aggregate')
export class AggregateController {
  constructor(private readonly aggregateService: AggregateService) {}
}
