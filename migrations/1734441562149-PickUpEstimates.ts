import { MigrationInterface, QueryRunner } from 'typeorm';

export class PickUpEstimates1734441562149 implements MigrationInterface {
  name = 'PickUpEstimates1734441562149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_678005daba1a2a8126ec7c0d853"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP CONSTRAINT "FK_5201b33041a3d678b0569231f5e"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "requestId"`);
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP COLUMN "rideRequestId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "pickupLocation" geometry(Point,4326) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "dropoffLocation" geometry(Point,4326) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "requestTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedFare" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedArrivalTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedDurationInMinutes" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "requestExpiryTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "riderId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "vehicleTypeId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedFareWithoutSurge" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedPickUpTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedPickUpTimeInMinutes" integer NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD "rideId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD "estimatedPickUpTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD "estimatedPickUpTimeInMinutes" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rides_status_enum" RENAME TO "rides_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rides_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "status" TYPE "public"."rides_status_enum" USING "status"::"text"::"public"."rides_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."rides_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_3c581fc8082dc803233ec676ef9" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD CONSTRAINT "FK_e47debd3d44368f977ae7b6b81a" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP CONSTRAINT "FK_e47debd3d44368f977ae7b6b81a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_3c581fc8082dc803233ec676ef9"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rides_status_enum_old" AS ENUM('in_progress', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "status" TYPE "public"."rides_status_enum_old" USING "status"::"text"::"public"."rides_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "status" SET DEFAULT 'in_progress'`,
    );
    await queryRunner.query(`DROP TYPE "public"."rides_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."rides_status_enum_old" RENAME TO "rides_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP COLUMN "estimatedPickUpTimeInMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP COLUMN "estimatedPickUpTime"`,
    );
    await queryRunner.query(`ALTER TABLE "ride_offers" DROP COLUMN "rideId"`);
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "estimatedFareWithoutSurge"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "vehicleTypeId"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "riderId"`);
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "requestExpiryTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "estimatedDurationInMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "estimatedArrivalTime"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "estimatedFare"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "requestTime"`);
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "dropoffLocation"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "pickupLocation"`);
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD "rideRequestId" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "rides" ADD "requestId" integer`);
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD CONSTRAINT "FK_5201b33041a3d678b0569231f5e" FOREIGN KEY ("rideRequestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_678005daba1a2a8126ec7c0d853" FOREIGN KEY ("requestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
