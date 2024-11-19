import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedRatingAndRides1732005473167 implements MigrationInterface {
  name = 'AddedRatingAndRides1732005473167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rideRequests" DROP CONSTRAINT "FK_9851fd317a4d8a74e7d3be77242"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rideRequests" DROP CONSTRAINT "FK_454fc54f9de6d747f24d8052a45"`,
    );
    await queryRunner.query(`DROP TABLE "rideRequests"`);
    await queryRunner.query(`DROP TYPE "public"."rideRequests_status_enum"`);
    await queryRunner.query(`DROP TABLE "vehicleTypes"`);
    await queryRunner.query(`DROP TYPE "public"."vehicleTypes_typename_enum"`);
    await queryRunner.query(
      `CREATE TYPE "public"."vehicle_types_typename_enum" AS ENUM('economy', 'premium', 'family')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicle_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "typeName" "public"."vehicle_types_typename_enum" NOT NULL, "baseRate" numeric(10,2) NOT NULL, "perKmRate" numeric(10,2) NOT NULL, "perMinuteRate" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ride_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ride_requests" ("id" SERIAL NOT NULL, "pickupLocation" geometry(Point,4326) NOT NULL, "dropoffLocation" geometry(Point,4326) NOT NULL, "requestTime" TIMESTAMP NOT NULL, "status" "public"."ride_requests_status_enum" NOT NULL DEFAULT 'pending', "estimatedFare" numeric(10,2) NOT NULL, "estimatedArrivalTime" TIMESTAMP NOT NULL, "estimatedDuration" interval NOT NULL, "requestExpiryTime" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "riderId" integer, "vehicleTypeId" uuid, CONSTRAINT "PK_92c563a19918f0e48a844c143a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ride_acceptance_statuses_status_enum" AS ENUM('pending', 'accepted', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ride_acceptance_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."ride_acceptance_statuses_status_enum" NOT NULL DEFAULT 'pending', "responseTime" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "driver_id" integer, "ride_request_id" integer, CONSTRAINT "PK_4ecc9e77429fc6acdfea991b8bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rides_status_enum" AS ENUM('in_progress', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rides_cancelledby_enum" AS ENUM('rider', 'driver')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pickupLocation" geography(Point,4326) NOT NULL, "dropoffLocation" geography(Point,4326) NOT NULL, "currentLocation" geography(Point,4326), "routeTaken" geography(LineString,4326), "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP, "estimatedArrivalTime" TIMESTAMP NOT NULL, "distance" numeric(10,2) NOT NULL, "duration" interval NOT NULL, "baseFare" numeric(10,2) NOT NULL, "finalFare" numeric(10,2) NOT NULL, "status" "public"."rides_status_enum" NOT NULL DEFAULT 'in_progress', "cancellationReason" character varying, "cancelledBy" "public"."rides_cancelledby_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "request_id" integer, "driver_id" integer, "rider_id" integer, "vehicle_type_id" uuid, CONSTRAINT "PK_ca6f62fc1e999b139c7f28f07fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ratings_ratedby_enum" AS ENUM('driver', 'rider')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ratings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ratedBy" "public"."ratings_ratedby_enum" NOT NULL, "rating" numeric(2,1) NOT NULL, "feedbackText" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ride_id" uuid, "driver_id" integer, "rider_id" integer, CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_7cf9b2de3c048d948a491e2d30c" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_45245a5ff7c6b7dbd7d77bddf1c" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_6da0aa23c21f2765578bfbf5e6c" FOREIGN KEY ("ride_request_id") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_eb9b79805e6a7b6b244d2ab58a3" FOREIGN KEY ("request_id") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_fb13184768dea9734b022874c6f" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_d8ca08acdee36ad9774cbf1c57a" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_e9ac650f2f920e6a752f34d6915" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_c8816ffe28b4b32442e7beffe82" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_1c1ed1281a1bb3cfcc8b69dd107" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_1137a9f7865d579e2b89afe692f" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_1137a9f7865d579e2b89afe692f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_1c1ed1281a1bb3cfcc8b69dd107"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_c8816ffe28b4b32442e7beffe82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_e9ac650f2f920e6a752f34d6915"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_d8ca08acdee36ad9774cbf1c57a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_fb13184768dea9734b022874c6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_eb9b79805e6a7b6b244d2ab58a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_6da0aa23c21f2765578bfbf5e6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_45245a5ff7c6b7dbd7d77bddf1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_7cf9b2de3c048d948a491e2d30c"`,
    );
    await queryRunner.query(`DROP TABLE "ratings"`);
    await queryRunner.query(`DROP TYPE "public"."ratings_ratedby_enum"`);
    await queryRunner.query(`DROP TABLE "rides"`);
    await queryRunner.query(`DROP TYPE "public"."rides_cancelledby_enum"`);
    await queryRunner.query(`DROP TYPE "public"."rides_status_enum"`);
    await queryRunner.query(`DROP TABLE "ride_acceptance_statuses"`);
    await queryRunner.query(
      `DROP TYPE "public"."ride_acceptance_statuses_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "ride_requests"`);
    await queryRunner.query(`DROP TYPE "public"."ride_requests_status_enum"`);
    await queryRunner.query(`DROP TABLE "vehicle_types"`);
    await queryRunner.query(`DROP TYPE "public"."vehicle_types_typename_enum"`);
  }
}
