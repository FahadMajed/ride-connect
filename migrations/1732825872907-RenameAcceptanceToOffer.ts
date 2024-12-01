import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAcceptanceToOffer1732825872907
  implements MigrationInterface
{
  name = 'RenameAcceptanceToOffer1732825872907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_drivers_location_status"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_drivers_location"`);
    await queryRunner.query(`DROP INDEX "public"."idx_drivers_available"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_available_drivers_location"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ride_offers_status_enum" AS ENUM('pending', 'accepted', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ride_offers" ("id" SERIAL NOT NULL, "status" "public"."ride_offers_status_enum" NOT NULL DEFAULT 'pending', "responseTime" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "driverId" integer NOT NULL, "rideRequestId" integer NOT NULL, CONSTRAINT "PK_8bd0ac2b8b108f575ceea9cb433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD CONSTRAINT "FK_59e126ca76a45cf7bdd74b817a0" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" ADD CONSTRAINT "FK_5201b33041a3d678b0569231f5e" FOREIGN KEY ("rideRequestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP CONSTRAINT "FK_5201b33041a3d678b0569231f5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_offers" DROP CONSTRAINT "FK_59e126ca76a45cf7bdd74b817a0"`,
    );
    await queryRunner.query(`DROP TABLE "ride_offers"`);
    await queryRunner.query(`DROP TYPE "public"."ride_offers_status_enum"`);
    await queryRunner.query(
      `CREATE INDEX "idx_available_drivers_location" ON "drivers" USING GiST ("currentLocation") WHERE ("isAvailable" = true)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_drivers_available" ON "drivers" ("isAvailable") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_drivers_location" ON "drivers" USING GiST ("currentLocation") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_drivers_location_status" ON "drivers" USING GiST ("currentLocation") WHERE (("isActive" = true) AND ("isAvailable" = true))`,
    );
  }
}
