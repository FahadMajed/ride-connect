import { QueryRunner } from 'typeorm';
import { SurgeArea, VehicleType } from './entities';

export class Pricer {
  static async estimateFare(request: {
    pickUpLocation: [number, number];
    vehicleTypeId: number;
    distanceKm: number;
    estimatedDurationInMinutes: number;
    queryRunner: QueryRunner;
  }): Promise<{
    estimatedFare: number;
    estimatedFareWithoutSurge: number;
  }> {
    const {
      pickUpLocation,
      vehicleTypeId,
      estimatedDurationInMinutes,
      queryRunner,
      distanceKm,
    } = request;

    const vehicleType = await queryRunner.manager.findOneOrFail(VehicleType, {
      where: { id: vehicleTypeId },
    });

    const surgeMultiplier = await SurgeArea.getMultiplierForPoint(
      pickUpLocation,
      queryRunner,
    );

    const { estimatedFare, estimatedFareWithoutSurge } =
      await this.calculateEstimatedFare({
        distanceKm: distanceKm,
        vehicleType: vehicleType,
        surgeMultiplier: surgeMultiplier,
        queryRunner: queryRunner,
        estimatedDurationInMinutes: estimatedDurationInMinutes,
      });

    return {
      estimatedFare: estimatedFare,
      estimatedFareWithoutSurge: estimatedFareWithoutSurge,
    };
  }

  private static async calculateEstimatedFare(request: {
    distanceKm: number;
    estimatedDurationInMinutes: number;
    vehicleType: VehicleType;
    surgeMultiplier: number;
    queryRunner: QueryRunner;
  }): Promise<{
    estimatedFare: number;
    estimatedFareWithoutSurge: number;
  }> {
    const { vehicleType, surgeMultiplier, distanceKm } = request;

    const baseFare = Number(vehicleType.baseRate);
    const distanceFare = distanceKm * Number(vehicleType.perKmRate);
    const timeFare = distanceKm * 2 * Number(vehicleType.perMinuteRate);

    return {
      estimatedFare: (baseFare + distanceFare + timeFare) * surgeMultiplier,
      estimatedFareWithoutSurge: baseFare + distanceFare + timeFare,
    };
  }
}

export class TimeEstimator {
  static async calculateTimeEstimates(
    pickUpLocation: [number, number],
    dropoffLocation: [number, number],
  ): Promise<{
    estimatedDurationInMinutes: number;
    estimatedArrivalTime: Date;
    distanceKm: number;
  }> {
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pickUpLocation[0]},${pickUpLocation[1]}&destination=${dropoffLocation[0]},${dropoffLocation[1]}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error('Error fetching data from Google Maps API');
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const durationSeconds = leg.duration.value;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    const estimatedDurationInMinutes = durationMinutes % 60;

    const estimatedArrivalTime = new Date(Date.now() + durationSeconds * 1000);

    const distanceKm = leg.distance.value / 1000;
    return {
      estimatedDurationInMinutes,
      estimatedArrivalTime,
      distanceKm,
    };
  }
}
