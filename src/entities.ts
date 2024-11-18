// src/entities/driver.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Point,
} from 'typeorm';

@Entity('drivers')
export class Driver {
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
  currentLocation: Point;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/entities/rider.entity.ts

@Entity('riders')
export class Rider {
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

@Entity('vehicleTypes')
export class VehicleType {
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

@Entity('rideRequests')
export class RideRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Rider)
  @JoinColumn({ name: 'riderId' })
  rider: Rider;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  pickupLocation: Point;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  dropoffLocation: Point;

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
}
