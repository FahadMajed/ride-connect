import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetUp1731936131896 implements MigrationInterface {
  name = 'SetUp1731936131896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query('CREATE EXTENSION postgis;');

    await queryRunner.query(
      `CREATE TYPE "public"."drivers_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drivers_availabilitystatus_enum" AS ENUM('online', 'offline')`,
    );
    await queryRunner.query(
      `CREATE TABLE "drivers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "status" "public"."drivers_status_enum" NOT NULL DEFAULT 'active', "averageRating" numeric(2,1) NOT NULL DEFAULT '0', "vehicleMake" character varying NOT NULL, "vehicleModel" character varying NOT NULL, "vehicleColor" character varying NOT NULL, "plateNumber" character varying NOT NULL, "driverLicenseNumber" character varying NOT NULL, "availabilityStatus" "public"."drivers_availabilitystatus_enum" NOT NULL DEFAULT 'offline', "currentLocation" geometry(Point,4326), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d4cfc1aafe3a14622aee390edb2" UNIQUE ("email"), CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."riders_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `CREATE TABLE "riders" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "status" "public"."riders_status_enum" NOT NULL DEFAULT 'active', "averageRating" numeric(2,1) NOT NULL DEFAULT '0', "preferredPaymentMethod" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ed6e8eb2542a3c7c1742f9c2b54" UNIQUE ("email"), CONSTRAINT "PK_6c17e67f760677500c29d68e689" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vehicleTypes_typename_enum" AS ENUM('economy', 'premium', 'family')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicleTypes" ("id" SERIAL NOT NULL, "typeName" "public"."vehicleTypes_typename_enum" NOT NULL, "baseRate" numeric(10,2) NOT NULL, "perKmRate" numeric(10,2) NOT NULL, "perMinuteRate" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6af3887f94f96b42a8cbc4b1723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rideRequests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rideRequests" ("id" SERIAL NOT NULL, "pickupLocation" geometry(Point,4326) NOT NULL, "dropoffLocation" geometry(Point,4326) NOT NULL, "requestTime" TIMESTAMP NOT NULL, "status" "public"."rideRequests_status_enum" NOT NULL DEFAULT 'pending', "estimatedFare" numeric(10,2) NOT NULL, "estimatedArrivalTime" TIMESTAMP NOT NULL, "estimatedDuration" interval NOT NULL, "requestExpiryTime" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "riderId" integer, "vehicleTypeId" integer, CONSTRAINT "PK_b9e10231a76684ad158b7c72330" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "rideRequests" ADD CONSTRAINT "FK_454fc54f9de6d747f24d8052a45" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rideRequests" ADD CONSTRAINT "FK_9851fd317a4d8a74e7d3be77242" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicleTypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(`DROP TABLE "riders"`);
    await queryRunner.query(`DROP TYPE "public"."riders_status_enum"`);
    await queryRunner.query(`DROP TABLE "drivers"`);
    await queryRunner.query(
      `DROP TYPE "public"."drivers_availabilitystatus_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."drivers_status_enum"`);
  }
}
