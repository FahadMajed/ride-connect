import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEstimation1733748262851 implements MigrationInterface {
  name = 'RenameEstimation1733748262851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_requests" RENAME COLUMN "estimatedDuration" TO "estimatedDurationInMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP COLUMN "estimatedDurationInMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD "estimatedDurationInMinutes" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP COLUMN "estimatedDurationInMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD "estimatedDurationInMinutes" interval NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_requests" RENAME COLUMN "estimatedDurationInMinutes" TO "estimatedDuration"`,
    );
  }
}
