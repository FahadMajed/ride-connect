import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedFareWithoutSurge1732019791582 implements MigrationInterface {
  name = 'AddedFareWithoutSurge1732019791582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_requests" ADD "estimatedFareWithoutSurge" numeric(10,2) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_requests" DROP COLUMN "estimatedFareWithoutSurge"`,
    );
  }
}
