// src/entities/driver.entity.ts

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

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'suspended';

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

  @Column({
    type: 'enum',
    enum: ['online', 'offline'],
    default: 'offline',
  })
  availabilityStatus: 'online' | 'offline';

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
      .where('driver.status = :status', { status: 'active' })
      .andWhere('driver.availabilityStatus = :availabilityStatus', {
        availabilityStatus: 'online',
      })
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

  @Column('interval')
  estimatedDuration: string;

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
    data: {
      riderId: number;
      vehicleTypeId: number;
      pickupLocation: [number, number];
      dropoffLocation: [number, number];
      surgeMultiplier: number;
    },
  ): Promise<RideRequest> {
    const vehicleType = await queryRunner.manager.findOneOrFail(VehicleType, {
      where: { id: data.vehicleTypeId },
    });
    const distanceKm = await this.calculateDistance(
      queryRunner,
      data.pickupLocation,
      data.dropoffLocation,
    );

    const { estimatedFare, estimatedFareWithoutSurge } =
      await this.calculateEstimatedFare({
        distanceKm: distanceKm,
        vehicleType: vehicleType,
        surgeMultiplier: data.surgeMultiplier,
        queryRunner: queryRunner,
      });

    const { estimatedDuration, estimatedArrivalTime } =
      this.calculateTimeEstimates(distanceKm);

    const rideRequest = this.create({
      riderId: data.riderId,
      vehicleTypeId: data.vehicleTypeId,
      pickupLocation: { type: 'Point', coordinates: data.pickupLocation },
      dropoffLocation: { type: 'Point', coordinates: data.dropoffLocation },
      status: 'pending',
      requestTime: new Date(),
      estimatedArrivalTime: estimatedArrivalTime,
      estimatedFareWithoutSurge: estimatedFareWithoutSurge,
      estimatedFare: estimatedFare,
      estimatedDuration: estimatedDuration,
      requestExpiryTime: new Date(Date.now() + 5 * 60000),
    });

    return queryRunner.manager.save(rideRequest);
  }

  private static async calculateEstimatedFare(request: {
    distanceKm: number;
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

  private static async calculateDistance(
    queryRunner: QueryRunner,
    pickupPoint: [number, number],
    dropoffPoint: [number, number],
  ): Promise<number> {
    const result = await queryRunner.query(
      `
    SELECT ST_Distance(
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
    ) / 1000 as distance
  `,
      [pickupPoint[0], pickupPoint[1], dropoffPoint[0], dropoffPoint[1]],
    );

    return parseFloat(result[0].distance);
  }
  private static calculateTimeEstimates(distanceKm: number) {
    // Assuming average speed of 40 km/h in city traffic
    const averageSpeedKmh = 40;

    // Calculate duration in minutes
    const durationMinutes = Math.ceil((distanceKm / averageSpeedKmh) * 60);

    // Format duration as interval string HH:MM:00
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const estimatedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

    // Calculate estimated arrival (current time + duration)
    const estimatedArrivalTime = new Date(
      Date.now() + durationMinutes * 60 * 1000,
    );

    return {
      estimatedDuration,
      estimatedArrivalTime,
    };
  }
}

@Entity('ride_acceptance_statuses')
export class RideAcceptanceStatus extends BaseEntity {
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

  @Column()
  responseTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  driverId: number;

  @Column()
  rideRequestId: number;
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

  @ManyToOne(() => Rider)
  @JoinColumn({ name: 'riderId' })
  rider: Rider;

  @ManyToOne(() => VehicleType)
  @JoinColumn({ name: 'vehicleTypeId' })
  vehicleType: VehicleType;

  @Column('geography', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  pickupLocation: any;

  @Column('geography', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  dropoffLocation: any;

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

  @Column()
  estimatedArrivalTime: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  distance: number;

  @Column('interval')
  duration: string;

  @Column('decimal', { precision: 10, scale: 2 })
  baseFare: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalFare: number;

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
