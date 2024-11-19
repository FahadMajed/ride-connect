import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules';
import { driverFactory, riderFactory, vehicleTypeFactory } from './factory';
import {
  Driver,
  RideAcceptanceStatus,
  Rider,
  RideRequest,
  SurgeArea,
  VehicleType,
} from 'src/entities';
import { DataSource } from 'typeorm';

describe('Ride Requests (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // SET FK CONSTRAINTS TO 1
  });
  afterEach(async () => {
    const dataSource = app.get(DataSource);

    await dataSource.query(
      'TRUNCATE TABLE ' +
        dataSource.entityMetadatas
          .map((entity) => '"' + entity.tableName + '"')
          .join(', ') +
        ' CASCADE;',
    );
  });

  describe('(POST) /ride-requests', () => {
    test('should create a ride request and generate acceptance requests for nearby drivers', async () => {
      // 1. Setup test data
      const rider = riderFactory({
        status: 'active',
      });

      await Rider.save(rider);

      const vehicleType = vehicleTypeFactory({
        typeName: 'economy',
      });

      await VehicleType.save(vehicleType);

      // Create 3 nearby drivers
      const nearbyDrivers = [
        driverFactory({
          status: 'active',
          availabilityStatus: 'online',
          currentLocation: {
            type: 'Point',
            coordinates: [55.2744, 25.2048], // Somewhere in Dubai
          },
          vehicleTypeId: vehicleType.id,
        }),
        driverFactory({
          status: 'active',
          availabilityStatus: 'online',
          currentLocation: {
            type: 'Point',
            coordinates: [55.2754, 25.2058], // ~200m away
          },
          vehicleTypeId: vehicleType.id,
        }),
        driverFactory({
          status: 'active',
          availabilityStatus: 'online',
          currentLocation: {
            type: 'Point',
            coordinates: [55.2764, 25.2068], // ~400m away
          },
          vehicleTypeId: vehicleType.id,
        }),
      ];

      const farDriver = driverFactory({
        status: 'active',
        availabilityStatus: 'online',
        currentLocation: {
          type: 'Point',
          coordinates: [55.3744, 25.3048], // Somewhere else
        },
        vehicleTypeId: vehicleType.id,
      });

      await Driver.save(nearbyDrivers);
      await Driver.save(farDriver);

      // 2. Make request to create ride request
      const response = await request(app.getHttpServer())
        .post('/ride-requests')
        .send({
          riderId: rider.id,
          vehicleTypeId: vehicleType.id,
          pickupLocation: [55.2744, 25.2048], // Same as first driver

          dropoffLocation: [55.3744, 25.3048], // Some destination
        });

      // 3. Verify response
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');

      // 4. Verify database state
      // Check ride request was created
      const rideRequest = await RideRequest.findOne({
        where: { id: response.body.id },
        relations: ['rider', 'vehicleType'],
      });
      expect(rideRequest).toBeDefined();
      expect(rideRequest.rider.id).toBe(rider.id);
      expect(rideRequest.vehicleType.id).toBe(vehicleType.id);

      // Verify ride acceptance requests were created for all nearby drivers
      const acceptanceRequests = await RideAcceptanceStatus.find({
        where: { rideRequest: { id: response.body.id } },
        relations: ['driver'],
      });

      expect(acceptanceRequests).toHaveLength(3);

      expect(acceptanceRequests.map((ar) => ar.status)).toEqual([
        'pending',
        'pending',
        'pending',
      ]);
      expect(acceptanceRequests.map((ar) => ar.driver.id)).toEqual(
        nearbyDrivers.map((d) => d.id),
      );
    });

    test('should apply surge pricing change when the pickup location is in a surge area', async () => {
      // 1. Setup test data
      const rider = riderFactory({
        status: 'active',
      });
      await Rider.save(rider);

      const vehicleType = vehicleTypeFactory({
        typeName: 'economy',
        baseRate: 10,
        perKmRate: 2,
        perMinuteRate: 0.5,
      });
      await VehicleType.save(vehicleType);

      // Create a nearby driver
      const driver = driverFactory({
        status: 'active',
        availabilityStatus: 'online',
        currentLocation: {
          type: 'Point',
          coordinates: [55.2744, 25.2048],
        },
        vehicleTypeId: vehicleType.id,
      });
      await Driver.save(driver);

      // Create a surge area that covers our pickup location
      const surgeArea = new SurgeArea();
      surgeArea.name = 'Test Surge Area';
      surgeArea.multiplier = 1.8;
      surgeArea.status = 'active';
      // Create a polygon that definitely includes our pickup point
      surgeArea.area = {
        type: 'Polygon',
        coordinates: [
          [
            [55.27, 25.2], // bottom-left
            [55.28, 25.2], // bottom-right
            [55.28, 25.21], // top-right
            [55.27, 25.21], // top-left
            [55.27, 25.2], // close the polygon
          ],
        ],
      };
      await SurgeArea.save(surgeArea);

      // 2. Make request to create ride request
      const response = await request(app.getHttpServer())
        .post('/ride-requests')
        .send({
          riderId: rider.id,
          vehicleTypeId: vehicleType.id,
          pickupLocation: [55.2744, 25.2048], // Inside surge area
          dropoffLocation: [55.3744, 25.3048],
        });

      // 3. Verify response
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');

      // 4. Verify database state
      const rideRequest = await RideRequest.findOne({
        where: { id: response.body.id },
      });

      // Verify that the estimated fare reflects surge pricing
      // The fare should be roughly 1.8 times what it would be without surge
      // but we'll allow some floating-point variance
      const baseEstimate = await RideRequest.findOne({
        where: {
          riderId: rider.id,
          vehicleTypeId: vehicleType.id,
          status: 'pending',
        },
      });

      expect(Number(rideRequest.estimatedFare)).toBeGreaterThan(
        Number(baseEstimate.estimatedFareWithoutSurge) * 1.7, // allowing some variance
      );
      expect(Number(rideRequest.estimatedFare)).toBeLessThan(
        Number(baseEstimate.estimatedFareWithoutSurge) * 1.9, // allowing some variance
      );
    });
  });
});
