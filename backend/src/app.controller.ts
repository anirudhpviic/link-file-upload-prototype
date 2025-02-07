import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  async check() {
    return `Server Up And Running On Port ${process.env.PORT}`;
  }
}
