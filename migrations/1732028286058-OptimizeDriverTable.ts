import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeDriverTable1732028286058 implements MigrationInterface {
  name = 'OptimizeDriverTable1732028286058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "isActive" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "isAvailable" boolean NOT NULL`,
    );

    // Migrate existing data
    await queryRunner.query(`
      UPDATE drivers 
      SET 
        "isActive" = CASE WHEN status = 'active' THEN true ELSE false END,
        "isAvailable" = CASE WHEN "availabilityStatus" = 'online' THEN true ELSE false END
    `);

    // Drop old columns

    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."drivers_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "drivers" DROP COLUMN "availabilityStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."drivers_availabilitystatus_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "isAvailable"`);
    await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "isActive"`);
    await queryRunner.query(
      `CREATE TYPE "public"."drivers_availabilitystatus_enum" AS ENUM('online', 'offline')`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "availabilityStatus" "public"."drivers_availabilitystatus_enum" NOT NULL DEFAULT 'offline'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."drivers_status_enum" AS ENUM('active', 'inactive', 'suspended')`,
    );
    await queryRunner.query(
      `ALTER TABLE "drivers" ADD "status" "public"."drivers_status_enum" NOT NULL DEFAULT 'active'`,
    );
  }
}
