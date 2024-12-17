import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Driver,
  Payment,
  PaymentMethod,
  Rating,
  Ride,
  RideOffer,
  Rider,
  SurgeArea,
  VehicleType,
} from './entities';

import * as dotenv from 'dotenv';
import { RidesController } from './controllers';
dotenv.config({ path: '.env.dev' });
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Driver,
        Rider,
        Ride,
        Rating,
        VehicleType,
        Ride,
        RideOffer,
        Payment,
        PaymentMethod,
        SurgeArea,
      ],

      synchronize: false,
      migrations: [__dirname + '../../migrations/*.ts'],
    }),
    TypeOrmModule.forFeature([
      Driver,
      Rider,
      Ride,
      Rating,
      VehicleType,
      Ride,
      RideOffer,
      Payment,
      PaymentMethod,
      SurgeArea,
    ]),
  ],
  controllers: [RidesController],
  providers: [],
})
export class AppModule {}
