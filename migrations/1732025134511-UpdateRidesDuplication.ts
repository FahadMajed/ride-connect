import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRidesDuplication1732025134511 implements MigrationInterface {
  name = 'UpdateRidesDuplication1732025134511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_3c581fc8082dc803233ec676ef9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "pickupLocation"`);
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "dropoffLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "estimatedArrivalTime"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "distance"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "duration"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "baseFare"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "finalFare"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "riderId"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "vehicleTypeId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rides" ADD "vehicleTypeId" integer`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "riderId" integer`);
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "finalFare" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "baseFare" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "duration" interval NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "distance" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedArrivalTime" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "dropoffLocation" geography(Point,4326) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "pickupLocation" geography(Point,4326) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_3c581fc8082dc803233ec676ef9" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
