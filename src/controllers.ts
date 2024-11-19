import {
  Body,
  Controller,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Driver, RideAcceptanceStatus, RideRequest } from './entities';
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
      // 1. Create the ride request
      const rideRequest = RideRequest.create({
        riderId: request.riderId,
        vehicleTypeId: request.vehicleTypeId,
        pickupLocation: { type: 'Point', coordinates: request.pickupLocation },
        dropoffLocation: {
          type: 'Point',
          coordinates: request.dropoffLocation,
        },
        status: 'pending',
        requestTime: new Date(),
        estimatedFare: 0,
        estimatedArrivalTime: new Date(Date.now() + 10 * 60000),
        estimatedDuration: '00:30:00',
        requestExpiryTime: new Date(Date.now() + 5 * 60000),
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

      // 3. Create ride acceptance requests for each driver
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
}
