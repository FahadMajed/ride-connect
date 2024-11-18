import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './entities';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
