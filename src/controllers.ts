import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Driver,
  Ride,
  RideAcceptanceStatus,
  RideRequest,
  SurgeArea,
} from './entities';
import { DataSource } from 'typeorm';

@Controller('ride-requests')
export class RideRequestController {
  constructor(private readonly dataSource: DataSource) {}

  @Post()
  async createRideRequest(
    @Body()
    request: {
      riderId: number;
      pickupLocation: [number, number];
      dropoffLocation: [number, number];

      vehicleTypeId: number;
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //1. Create ride request with surge multiplier
      const surgeMultiplier = await SurgeArea.getMultiplierForPoint(
        request.pickupLocation,
        queryRunner,
      );

      const rideRequest = await RideRequest.createRequest(queryRunner, {
        riderId: request.riderId,

        vehicleTypeId: request.vehicleTypeId,
        pickupLocation: request.pickupLocation,
        dropoffLocation: request.dropoffLocation,
        surgeMultiplier: surgeMultiplier,
      });

      await queryRunner.manager.save(rideRequest);

      // 2. Find nearby drivers
      const nearbyDrivers = await Driver.findNearbyDriversIds(
        request.pickupLocation,
        queryRunner,
      );

      if (nearbyDrivers.length === 0) {
        throw new UnprocessableEntityException('No nearby drivers available');
      }

      // 3. Create ride acceptance requests for each nearby driver
      const acceptances = nearbyDrivers.map((driverId) =>
        RideAcceptanceStatus.create({
          driverId: driverId,
          rideRequestId: rideRequest.id,
          status: 'pending',
          responseTime: new Date(),
        }),
      );

      await queryRunner.manager.save(acceptances);
      await queryRunner.commitTransaction();

      // 4. Return ride request with relations
      return RideRequest.findOne({
        where: { id: rideRequest.id },
        relations: ['rider', 'vehicleType'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @Post(':id/accept')
  async acceptRide(
    @Param('id', ParseIntPipe) requestId: number,
    @Body() request: { driverId: number },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const acceptance = await RideAcceptanceStatus.acceptRideRequest(
        requestId,
        request.driverId,
        queryRunner,
      );

      const ride = await Ride.createFromRequest(
        queryRunner,
        request.driverId,
        acceptance.rideRequest,
      );

      await queryRunner.commitTransaction();
      return ride;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
