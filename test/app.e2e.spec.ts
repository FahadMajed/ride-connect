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
  VehicleType,
} from 'src/entities';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // This handles FK constraints automatically in PostgreSQL
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
      }),
      driverFactory({
        status: 'active',
        availabilityStatus: 'online',
        currentLocation: {
          type: 'Point',
          coordinates: [55.2754, 25.2058], // ~200m away
        },
      }),
      driverFactory({
        status: 'active',
        availabilityStatus: 'online',
        currentLocation: {
          type: 'Point',
          coordinates: [55.2764, 25.2068], // ~400m away
        },
      }),
    ];

    await Driver.save(nearbyDrivers);

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
});
