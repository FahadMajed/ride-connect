// import { faker } from '@faker-js/faker';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/modules';
import { driverFactory, riderFactory, vehicleTypeFactory } from './factory';
import {
  Driver,
  Ride,
  RideOffer,
  Rider,
  RideRequest,
  SurgeArea,
  VehicleType,
} from 'src/entities';
import { DataSource, Not } from 'typeorm';
import { TimeEstimator } from 'src/services';

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
  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.query(
      'TRUNCATE TABLE "riders", "drivers", "ride_requests", "ride_offers", rides CASCADE;',
    );
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // const dataSource = app.get(DataSource);

    // const vehicleType = await dataSource
    //   .getRepository(VehicleType)
    //   .save(vehicleTypeFactory());
    // for (let i = 0; i < 10000; i++) {
    // await dataSource.getRepository(Driver).save(
    //   driverFactory({
    //     id: Number(
    //       faker.number.int({
    //         min: 1000,
    //         max: 9999999,
    //       }),
    //     ),
    //     currentLocation: { type: 'Point', coordinates: [55.2744, 25.2048] },
    //     isActive: i % 2 == 0 ? true : false,
    //     vehicleTypeId: vehicleType.id,
    //     isAvailable: i % 2 == 0 ? true : false,
    //   }),
    // );
    // }

    jest.spyOn(TimeEstimator, 'calculateTimeEstimates').mockResolvedValue({
      estimatedDurationInMinutes: 20,
      estimatedArrivalTime: new Date(),
      distanceKm: 10,
    });
  });

  describe('(POST) /ride-requests', () => {
    test('should create a ride request and generate offers for nearby drivers', async () => {
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
          currentLocation: {
            type: 'Point',
            coordinates: [55.2744, 25.2048], // Somewhere in Dubai
          },
          vehicleTypeId: vehicleType.id,
        }),
        driverFactory({
          currentLocation: {
            type: 'Point',
            coordinates: [55.2754, 25.2058], // ~200m away
          },
          vehicleTypeId: vehicleType.id,
        }),
        driverFactory({
          currentLocation: {
            type: 'Point',
            coordinates: [55.2764, 25.2068], // ~400m away
          },
          vehicleTypeId: vehicleType.id,
        }),
      ];

      const farDriver = driverFactory({
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
      expect(response.body).toHaveProperty('rideRequestId');

      // 4. Verify database state
      // Check ride request was created
      const rideRequest = await RideRequest.findOne({
        where: { id: response.body.rideRequestId },
        relations: ['rider', 'vehicleType'],
      });
      expect(rideRequest).toBeDefined();
      expect(rideRequest.status).toBe('pending');
      expect(rideRequest.rider.id).toBe(rider.id);
      expect(rideRequest.vehicleType.id).toBe(vehicleType.id);

      // Verify ride offer requests were created for all nearby drivers
      const offers = await RideOffer.find({
        where: { rideRequest: { id: response.body.id } },
        relations: ['driver'],
      });

      expect(offers).toHaveLength(3);

      expect(offers.map((ar) => ar.status)).toEqual([
        'pending',
        'pending',
        'pending',
      ]);
      expect(offers.map((ar) => ar.driver.id)).toEqual(
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
      expect(response.body).toHaveProperty('rideRequestId');

      // 4. Verify database state
      const rideRequest = await RideRequest.findOne({
        where: { id: response.body.rideRequestId },
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

  describe('(POST) /ride-requests/:id/accept', () => {
    test('should successfully accept a ride request and create a ride', async () => {
      // 1. Setup test data
      const rider = riderFactory({
        status: 'active',
      });
      await Rider.save(rider);

      const vehicleType = vehicleTypeFactory({
        typeName: 'economy',
      });
      await VehicleType.save(vehicleType);

      const driver = driverFactory({
        currentLocation: {
          type: 'Point',
          coordinates: [55.2744, 25.2048],
        },
        vehicleTypeId: vehicleType.id,
      });
      await Driver.save(driver);

      // 2. Create initial ride request
      const createResponse = await request(app.getHttpServer())
        .post('/ride-requests')
        .send({
          riderId: rider.id,
          vehicleTypeId: vehicleType.id,
          pickupLocation: [55.2744, 25.2048],
          dropoffLocation: [55.3744, 25.3048],
        });

      // 3. Accept the ride request
      //get the ride offer status to get the driver id
      let offer = await RideOffer.findOne({
        where: { driverId: driver.id },
        relations: ['driver'],
      });

      expect(offer.driverId).toEqual(driver.id);

      const acceptResponse = await request(app.getHttpServer())
        .post(`/ride-requests/${offer.rideRequestId}/accept`)
        .send({
          driverId: driver.id,
        });

      // 4. Verify response
      expect(acceptResponse.status).toBe(201);
      expect(acceptResponse.body).toHaveProperty('id');
      expect(acceptResponse.body.status).toBe('in_progress');
      expect(acceptResponse.body.driver.id).toBe(driver.id);

      // 5. Verify database state
      // Check ride offer status
      offer = await RideOffer.findOne({
        where: {
          rideRequestId: createResponse.body.id,
          driverId: driver.id,
        },
      });
      expect(offer.status).toBe('accepted');

      // Check ride was created
      const ride = await Ride.findOne({
        where: { id: acceptResponse.body.id },
        relations: ['driver', 'request'],
      });
      expect(ride).toBeDefined();
      expect(ride.status).toBe('in_progress');
      expect(ride.driver.id).toBe(driver.id);
      expect(ride.request.id).toBe(createResponse.body.rideRequestId);
      expect(ride.startTime).toBeDefined();

      // Check other drivers' offer statuses were rejected
      const otherAcceptances = await RideOffer.find({
        where: {
          rideRequestId: createResponse.body.rideRequestId,
          driverId: Not(driver.id),
        },
      });
      otherAcceptances.forEach((offer) => {
        expect(offer.status).toBe('rejected');
      });
    });

    test('should prevent multiple drivers from accepting the same request', async () => {
      // 1. Setup test data
      const rider = riderFactory({
        status: 'active',
      });
      await Rider.save(rider);

      const vehicleType = vehicleTypeFactory({
        typeName: 'economy',
      });
      await VehicleType.save(vehicleType);

      // Create two drivers
      const driver1 = driverFactory({
        currentLocation: {
          type: 'Point',
          coordinates: [55.2744, 25.2048],
        },
        vehicleTypeId: vehicleType.id,
      });

      const driver2 = driverFactory({
        currentLocation: {
          type: 'Point',
          coordinates: [55.2745, 25.2049], // Slightly different location
        },
        vehicleTypeId: vehicleType.id,
      });

      await Driver.save([driver1, driver2]);

      // 2. Create ride request
      const createResponse = await request(app.getHttpServer())
        .post('/ride-requests')
        .send({
          riderId: rider.id,
          vehicleTypeId: vehicleType.id,
          pickupLocation: [55.2744, 25.2048],
          dropoffLocation: [55.3744, 25.3048],
        });

      // 3. First driver accepts the request
      const firstAcceptResponse = await request(app.getHttpServer())
        .post(`/ride-requests/${createResponse.body.rideRequestId}/accept`)
        .send({
          driverId: driver1.id,
        });

      expect(firstAcceptResponse.status).toBe(201);

      // 4. Second driver attempts to accept the same request
      const secondAcceptResponse = await request(app.getHttpServer())
        .post(`/ride-requests/${createResponse.body.rideRequestId}/accept`)
        .send({
          driverId: driver2.id,
        });

      // 5. Verify the second attempt fails
      expect(secondAcceptResponse.status).toBe(422);

      // 6. Verify database state
      // Check first driver's offer is still valid
      const firstDriverAcceptance = await RideOffer.findOne({
        where: {
          rideRequestId: createResponse.body.rideRequestId,
          driverId: driver1.id,
        },
      });
      expect(firstDriverAcceptance.status).toBe('accepted');

      // Check second driver's offer was rejected
      const secondDriverAcceptance = await RideOffer.findOne({
        where: {
          rideRequestId: createResponse.body.rideRequestId,
          driverId: driver2.id,
        },
      });
      expect(secondDriverAcceptance.status).toBe('rejected');

      // Verify only one ride was created
      const rides = await Ride.find({
        where: {
          request: { id: createResponse.body.rideRequestId },
        },
        relations: ['driver'],
      });
      expect(rides).toHaveLength(1);
      expect(rides[0].driver.id).toBe(driver1.id);
    });
  });
});
