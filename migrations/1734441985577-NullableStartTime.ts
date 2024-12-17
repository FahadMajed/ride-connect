import { MigrationInterface, QueryRunner } from 'typeorm';

export class NullableStartTime1734441985577 implements MigrationInterface {
  name = 'NullableStartTime1734441985577';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "estimatedPickUpTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "estimatedPickUpTimeInMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "startTime" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedPickUpTimeInMinutes" integer `,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedPickUpTime" TIMESTAMP  `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rides" ALTER COLUMN "startTime" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedPickUpTimeInMinutes" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "estimatedPickUpTime" TIMESTAMP NOT NULL`,
    );
  }
}
