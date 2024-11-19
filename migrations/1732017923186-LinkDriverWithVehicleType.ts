import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkDriverWithVehicleType1732017923186
  implements MigrationInterface
{
  name = 'LinkDriverWithVehicleType1732017923186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "vehicleTypeId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_7cf9b2de3c048d948a491e2d30c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ALTER COLUMN "riderId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ALTER COLUMN "vehicleTypeId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_5d5d7da1ff589084fa01a623a86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_ab90c20a49d85a53e1c13ab6a9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ALTER COLUMN "driverId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ALTER COLUMN "rideRequestId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD CONSTRAINT "FK_0d8f564aba07dc92aab31dbf0e2" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_7cf9b2de3c048d948a491e2d30c" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_5d5d7da1ff589084fa01a623a86" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_ab90c20a49d85a53e1c13ab6a9d" FOREIGN KEY ("rideRequestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_ab90c20a49d85a53e1c13ab6a9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_5d5d7da1ff589084fa01a623a86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_7cf9b2de3c048d948a491e2d30c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP CONSTRAINT "FK_0d8f564aba07dc92aab31dbf0e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ALTER COLUMN "rideRequestId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ALTER COLUMN "driverId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_ab90c20a49d85a53e1c13ab6a9d" FOREIGN KEY ("rideRequestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_5d5d7da1ff589084fa01a623a86" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ALTER COLUMN "vehicleTypeId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ALTER COLUMN "riderId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_7cf9b2de3c048d948a491e2d30c" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP COLUMN "vehicleTypeId"`,
    );
  }
}
