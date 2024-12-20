import { faker } from '@faker-js/faker';
import {
  Driver,
  Payment,
  PaymentMethod,
  Rating,
  Ride,
  RideOffer,
  Rider,
  SurgeArea,
  VehicleType,
} from 'src/entities';
import { LineString, Point, Polygon } from 'typeorm';

// Helper function to create a random GeoJSON point
const createRandomPoint = (): Point => ({
  type: 'Point',
  coordinates: [faker.location.longitude(), faker.location.latitude()],
});

// Helper function to create a random GeoJSON polygon
const createRandomPolygon = (): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [faker.location.longitude(), faker.location.latitude()],
      [faker.location.longitude(), faker.location.latitude()],
      [faker.location.longitude(), faker.location.latitude()],
      [faker.location.longitude(), faker.location.latitude()],
      [faker.location.longitude(), faker.location.latitude()],
    ],
  ],
});

// Helper function to create a random GeoJSON linestring
const createRandomLineString = (): LineString => ({
  type: 'LineString',
  coordinates: Array.from({ length: 5 }, () => [
    faker.location.longitude(),
    faker.location.latitude(),
  ]),
});

export const driverFactory = (
  overrides?: Partial<Driver>,
): Partial<Driver> => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  isActive: true,
  isAvailable: true,
  averageRating: parseFloat(
    faker.number.float({ min: 0, max: 5, fractionDigits: 1 }).toFixed(1),
  ),
  vehicleMake: faker.vehicle.manufacturer(),
  vehicleModel: faker.vehicle.model(),
  vehicleColor: faker.vehicle.color(),
  plateNumber: faker.vehicle.vrm(),
  driverLicenseNumber: faker.string.alphanumeric(10).toUpperCase(),
  currentLocation: createRandomPoint(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const riderFactory = (overrides?: Partial<Rider>): Partial<Rider> => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
  averageRating: parseFloat(
    faker.number.float({ min: 0, max: 5, fractionDigits: 1 }).toFixed(1),
  ),
  preferredPaymentMethod: faker.helpers.arrayElement([
    'credit_card',
    'debit_card',
  ]),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const vehicleTypeFactory = (
  overrides?: Partial<VehicleType>,
): Partial<VehicleType> => ({
  typeName: faker.helpers.arrayElement(['economy', 'premium', 'family']),
  baseRate: parseFloat(
    faker.number.float({ min: 5, max: 20, fractionDigits: 1 }).toFixed(2),
  ),
  perKmRate: parseFloat(
    faker.number.float({ min: 0.5, max: 2, fractionDigits: 1 }).toFixed(2),
  ),
  perMinuteRate: parseFloat(
    faker.number.float({ min: 0.1, max: 0.5, fractionDigits: 1 }).toFixed(2),
  ),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const rideAcceptanceStatusFactory = (
  overrides?: Partial<RideOffer>,
): Partial<RideOffer> => ({
  status: faker.helpers.arrayElement(['pending', 'accepted', 'rejected']),

  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const rideFactory = (overrides?: Partial<Ride>): Partial<Ride> => ({
  currentLocation: createRandomPoint(),
  routeTaken: createRandomLineString(),
  startTime: faker.date.past(),
  endTime: faker.date.future(),

  status: faker.helpers.arrayElement([
    'pending',
    'in_progress',
    'completed',
    'cancelled',
  ]),
  cancellationReason: faker.helpers.maybe(() => faker.lorem.sentence()),
  cancelledBy: faker.helpers.maybe(() =>
    faker.helpers.arrayElement(['rider', 'driver']),
  ),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const ratingFactory = (
  overrides?: Partial<Rating>,
): Partial<Rating> => ({
  ratedBy: faker.helpers.arrayElement(['driver', 'rider']),
  rating: parseFloat(
    faker.number.float({ min: 1, max: 5, fractionDigits: 1 }).toFixed(1),
  ),
  feedbackText: faker.helpers.maybe(() => faker.lorem.sentence()),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const surgeAreaFactory = (
  overrides?: Partial<SurgeArea>,
): Partial<SurgeArea> => ({
  name: faker.location.city(),
  area: createRandomPolygon(),
  multiplier: parseFloat(
    faker.number.float({ min: 1.1, max: 3.0, fractionDigits: 1 }).toFixed(2),
  ),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const paymentFactory = (
  overrides?: Partial<Payment>,
): Partial<Payment> => ({
  amount: parseFloat(
    faker.number.float({ min: 10, max: 200, fractionDigits: 1 }).toFixed(2),
  ),
  paymentStatus: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
  paymentMethod: faker.helpers.arrayElement(['credit_card', 'debit_card']),
  transactionId: faker.string.uuid(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const paymentMethodFactory = (
  overrides?: Partial<PaymentMethod>,
): Partial<PaymentMethod> => ({
  methodType: faker.helpers.arrayElement(['credit_card', 'debit_card']),
  cardNumber: faker.finance.creditCardNumber(),
  expiryDate: faker.date.future(),
  isDefault: faker.datatype.boolean(),
  status: faker.helpers.arrayElement(['active', 'inactive']),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});
