// src/entities/driver.entity.ts

import { UnprocessableEntityException } from '@nestjs/common';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  BaseEntity,
  Polygon,
  LineString,
  QueryRunner,
} from 'typeorm';

@Entity('riders')
export class Rider extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'suspended';

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column({ nullable: true })
  preferredPaymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('vehicle_types')
export class VehicleType extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: ['economy', 'premium', 'family'],
  })
  typeName: 'economy' | 'premium' | 'family';

  @Column('decimal', { precision: 10, scale: 2 })
  baseRate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  perKmRate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  perMinuteRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
@Entity('drivers')
export class Driver extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column('bool')
  isActive: boolean;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column()
  vehicleMake: string;

  @Column()
  vehicleModel: string;

  @Column()
  vehicleColor: string;

  @Column()
  plateNumber: string;

  @Column()
  driverLicenseNumber: string;

  @ManyToOne(() => VehicleType)
  @JoinColumn({ name: 'vehicleTypeId' })
  vehicleType: VehicleType;

  @Column()
  vehicleTypeId: number;

  @Column('bool')
  isAvailable: boolean;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  currentLocation: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async findNearbyDriversIds(
    pickupLocation: [number, number],
    queryRunner?: QueryRunner,
  ): Promise<number[]> {
    const query = Driver.createQueryBuilder('driver')
      .select('driver.id')
      .addSelect(`ST_AsGeoJSON(driver.currentLocation)`, 'location')
      .where('driver.isActive = :isActive', { isActive: true })
      .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })

      .andWhere(
        `ST_DWithin(
                    driver."currentLocation"::geography,
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                    :distance
                )`,
        {
          longitude: pickupLocation[0],
          latitude: pickupLocation[1],
          distance: 5000, // 5km in meters
        },
      )
      .orderBy(
        `ST_Distance(
                    driver."currentLocation"::geography,
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
                )`,
      )
      .limit(5);

    // If queryRunner is provided, use it
    if (queryRunner) {
      query.setQueryRunner(queryRunner);
    }

    const results = await query.getRawMany();

    return results.map((row) => row.driver_id);
  }
}

@Entity('ride_requests')
export class RideRequest extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Rider)
  @JoinColumn({ name: 'riderId' })
  rider: Rider;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  pickupLocation: any;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  dropoffLocation: any;

  @ManyToOne(() => VehicleType)
  @JoinColumn({ name: 'vehicleTypeId' })
  vehicleType: VehicleType;

  @Column()
  requestTime: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedFare: number;

  @Column()
  estimatedArrivalTime: Date;

  @Column('int', { nullable: true })
  estimatedDurationInMinutes: number;

  @Column()
  requestExpiryTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  riderId: number;
  @Column()
  vehicleTypeId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedFareWithoutSurge: number;

  static async createRequest(
    queryRunner: QueryRunner,
    request: {
      riderId: number;
      vehicleTypeId: number;
      pickupLocation: [number, number];
      dropoffLocation: [number, number];
      estimatedArrivalTime: Date;
      estimatedFareWithoutSurge: number;
      estimatedFare: number;
      estimatedDurationInMinutes: number;
    },
  ): Promise<RideRequest> {
    const rideRequest = this.create({
      riderId: request.riderId,
      vehicleTypeId: request.vehicleTypeId,

      pickupLocation: { type: 'Point', coordinates: request.pickupLocation },
      dropoffLocation: { type: 'Point', coordinates: request.dropoffLocation },
      status: 'pending',
      requestTime: new Date(),
      estimatedArrivalTime: request.estimatedArrivalTime,
      estimatedFareWithoutSurge: request.estimatedFareWithoutSurge,
      estimatedFare: request.estimatedFare,
      estimatedDurationInMinutes: request.estimatedDurationInMinutes,
      requestExpiryTime: new Date(Date.now() + 5 * 60000),
    });

    return queryRunner.manager.save(rideRequest);
  }
}

@Entity('ride_offers')
export class RideOffer extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @ManyToOne(() => RideRequest)
  @JoinColumn({ name: 'rideRequestId' })
  rideRequest: RideRequest;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  driverId: number;

  @Column()
  rideRequestId: number;

  static createRideOffers(
    nearbyDrivers: number[],
    rideRequest: RideRequest,
    queryRunner: QueryRunner,
  ) {
    const offers = nearbyDrivers.map((driverId) => {
      return this.create({
        driverId,
        rideRequestId: rideRequest.id,
        status: 'pending',
      });
    });

    return queryRunner.manager.save(offers);
  }

  static async acceptOffer(
    requestId: number,
    driverId: number,
    queryRunner: QueryRunner,
  ): Promise<RideOffer> {
    // Get the acceptance with pessimistic lock
    const offer = await queryRunner.manager
      .createQueryBuilder(RideOffer, 'offer')
      .setLock('pessimistic_write_or_fail')
      .innerJoinAndSelect('offer.rideRequest', 'request')
      .where('offer.rideRequestId = :requestId', { requestId })
      .andWhere('offer.driverId = :driverId', { driverId })
      .andWhere('offer.status = :status', { status: 'pending' })
      .getOne();

    if (!offer) {
      throw new UnprocessableEntityException('Ride request not available');
    }

    // Mark this offer as accepted
    offer.status = 'accepted';

    await queryRunner.manager.save(offer);

    // Mark other offers as rejected
    await queryRunner.manager
      .createQueryBuilder()
      .update(RideOffer)
      .set({ status: 'rejected' })
      .where('rideRequestId = :requestId', { requestId })
      .andWhere('id != :offerId', { offerId: offer.id })
      .execute();

    return offer;
  }
}

@Entity('rides')
export class Ride extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => RideRequest)
  @JoinColumn({ name: 'requestId' })
  request: RideRequest;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @Column('geography', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  currentLocation: any;

  @Column('geography', {
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  routeTaken: LineString;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ['in_progress', 'completed', 'cancelled'],
    default: 'in_progress',
  })
  status: 'in_progress' | 'completed' | 'cancelled';

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({
    type: 'enum',
    enum: ['rider', 'driver'],
    nullable: true,
  })
  cancelledBy: 'rider' | 'driver';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async createFromRequest(
    queryRunner: QueryRunner,
    driverId: number,
    rideRequest: RideRequest,
  ): Promise<Ride> {
    const ride = this.create({
      request: rideRequest,

      driver: { id: driverId },
      startTime: new Date(),
      status: 'in_progress',
    });

    return queryRunner.manager.save(ride);
  }
}
@Entity('ratings')
export class Rating extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Ride)
  @JoinColumn({ name: 'rideId' })
  ride: Ride;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @ManyToOne(() => Rider)
  @JoinColumn({ name: 'riderId' })
  rider: Rider;

  @Column({
    type: 'enum',
    enum: ['driver', 'rider'],
  })
  ratedBy: 'driver' | 'rider';

  @Column('decimal', { precision: 2, scale: 1 })
  rating: number;

  @Column({ nullable: true })
  feedbackText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('surge_areas')
export class SurgeArea extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column('geography', {
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  area: Polygon;

  @Column('decimal', { precision: 3, scale: 2 })
  multiplier: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static async getMultiplierForPoint(
    point: [number, number],
    queryRunner: QueryRunner,
  ): Promise<number> {
    const surgeArea = await queryRunner.manager
      .createQueryBuilder(SurgeArea, 'surge')
      .where(
        `ST_Contains(
          surge.area::geometry,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        )`,
        {
          longitude: point[0],
          latitude: point[1],
        },
      )
      .andWhere('surge.status = :status', { status: 'active' })
      .getOne();

    return parseFloat(surgeArea?.multiplier as any) || 1;
  }
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Ride)
  @JoinColumn({ name: 'rideId' })
  ride: Ride;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  paymentStatus: 'pending' | 'completed' | 'failed';

  @Column()
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Rider)
  @JoinColumn({ name: 'riderId' })
  rider: Rider;

  @Column({
    type: 'enum',
    enum: ['credit_card', 'debit_card'],
  })
  methodType: 'credit_card' | 'debit_card';

  @Column()
  cardNumber: string;

  @Column()
  expiryDate: Date;

  @Column({ default: false })
  isDefault: boolean;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
