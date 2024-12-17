import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Driver, RideOffer, Ride } from './entities';
import { DataSource } from 'typeorm';
import { TimeEstimator, Pricer } from './services';

@Controller('rides')
export class RidesController {
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
      //1. Calculate the estimated fare

      const { distanceKm, estimatedDurationInMinutes, estimatedArrivalTime } =
        await TimeEstimator.calculateTimeEstimates(
          request.pickupLocation,
          request.dropoffLocation,
        );

      const { estimatedFare, estimatedFareWithoutSurge } =
        await Pricer.estimateFare({
          vehicleTypeId: request.vehicleTypeId,
          pickUpLocation: request.pickupLocation,
          distanceKm: distanceKm,
          estimatedDurationInMinutes: estimatedDurationInMinutes,

          queryRunner,
        });

      // 1.5 Create ride request, the fare will be calculated in the RideRequest.createRequest method
      // then the ride request will be saved to the database
      const pendingRide = await Ride.createPendingRide({
        riderId: request.riderId,
        pickupLocation: request.pickupLocation,
        dropoffLocation: request.dropoffLocation,
        vehicleTypeId: request.vehicleTypeId,
        estimatedDurationInMinutes: estimatedDurationInMinutes,
        estimatedFare: estimatedFare,
        estimatedFareWithoutSurge: estimatedFareWithoutSurge,
        estimatedArrivalTime: estimatedArrivalTime,
      });

      await queryRunner.manager.save(pendingRide);

      // 2. Find nearby drivers
      const nearbyDrivers = await Driver.findNearbyDrivers(
        request.pickupLocation,
        queryRunner,
      );

      if (nearbyDrivers.length === 0) {
        throw new UnprocessableEntityException('No nearby drivers available');
      }

      // 3. Create ride acceptance requests for each nearby driver

      RideOffer.createRideOffers(nearbyDrivers, pendingRide, queryRunner);

      await queryRunner.commitTransaction();

      // 4. Return ride request id
      return {
        rideId: pendingRide.id,
        estimatedFare: pendingRide.estimatedFare,
        estimatedArrivalTime: pendingRide.estimatedArrivalTime,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @Post(':id/accept')
  async acceptRide(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() request: { driverId: number },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const offer = await RideOffer.acceptOffer(
        rideId,
        request.driverId,
        queryRunner,
      );

      const ride = await Ride.start(queryRunner, request.driverId, offer);

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
