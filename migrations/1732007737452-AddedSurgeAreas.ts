import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedSurgeAreas1732007737452 implements MigrationInterface {
  name = 'AddedSurgeAreas1732007737452';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."surge_areas_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "surge_areas" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "area" geography(Polygon,4326) NOT NULL, "multiplier" numeric(3,2) NOT NULL, "status" "public"."surge_areas_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_868794e4ab64d90fc4dbe3914f5" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "surge_areas"`);
    await queryRunner.query(`DROP TYPE "public"."surge_areas_status_enum"`);
  }
}
