import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CircuitBreakerInterceptor } from './common/interceptors/circuit-breaker.interceptor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseInterceptors(CircuitBreakerInterceptor)
  getData() {
    return this.appService.getData();
  }
}
