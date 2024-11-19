import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamedIds1732007909782 implements MigrationInterface {
  name = 'RenamedIds1732007909782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_45245a5ff7c6b7dbd7d77bddf1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_6da0aa23c21f2765578bfbf5e6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_eb9b79805e6a7b6b244d2ab58a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_fb13184768dea9734b022874c6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_d8ca08acdee36ad9774cbf1c57a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_e9ac650f2f920e6a752f34d6915"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_c8816ffe28b4b32442e7beffe82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_1c1ed1281a1bb3cfcc8b69dd107"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_1137a9f7865d579e2b89afe692f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP COLUMN "driver_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP COLUMN "ride_request_id"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "request_id"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "driver_id"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "rider_id"`);
    await queryRunner.query(
      `ALTER TABLE "rides" DROP COLUMN "vehicle_type_id"`,
    );
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "ride_id"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "driver_id"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "rider_id"`);
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD "driverId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD "rideRequestId" integer`,
    );
    await queryRunner.query(`ALTER TABLE "rides" ADD "requestId" integer`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "driverId" integer`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "riderId" integer`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "vehicleTypeId" uuid`);
    await queryRunner.query(`ALTER TABLE "ratings" ADD "rideId" integer`);
    await queryRunner.query(`ALTER TABLE "ratings" ADD "driverId" integer`);
    await queryRunner.query(`ALTER TABLE "ratings" ADD "riderId" integer`);
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "PK_ca6f62fc1e999b139c7f28f07fd"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "PK_ca6f62fc1e999b139c7f28f07fd" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "PK_0f31425b073219379545ad68ed9"`,
    );
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "ratings" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_5d5d7da1ff589084fa01a623a86" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_ab90c20a49d85a53e1c13ab6a9d" FOREIGN KEY ("rideRequestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_678005daba1a2a8126ec7c0d853" FOREIGN KEY ("requestId") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_0adda088d567495e71d21b6c691" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_3c581fc8082dc803233ec676ef9" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_5ea4e6b760b74bd49b9cdc58ca0" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_c94a1b5503ed744bb24587c2766" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_60acd0593bf5361ba5fd9e403a0" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_60acd0593bf5361ba5fd9e403a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_c94a1b5503ed744bb24587c2766"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "FK_5ea4e6b760b74bd49b9cdc58ca0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_3c581fc8082dc803233ec676ef9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_0adda088d567495e71d21b6c691"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "FK_678005daba1a2a8126ec7c0d853"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_ab90c20a49d85a53e1c13ab6a9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "FK_5d5d7da1ff589084fa01a623a86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" DROP CONSTRAINT "PK_0f31425b073219379545ad68ed9"`,
    );
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" DROP CONSTRAINT "PK_ca6f62fc1e999b139c7f28f07fd"`,
    );
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "rides" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "PK_ca6f62fc1e999b139c7f28f07fd" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "riderId"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "driverId"`);
    await queryRunner.query(`ALTER TABLE "ratings" DROP COLUMN "rideId"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "vehicleTypeId"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "riderId"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "driverId"`);
    await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "requestId"`);
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP COLUMN "rideRequestId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" DROP COLUMN "driverId"`,
    );
    await queryRunner.query(`ALTER TABLE "ratings" ADD "rider_id" integer`);
    await queryRunner.query(`ALTER TABLE "ratings" ADD "driver_id" integer`);
    await queryRunner.query(`ALTER TABLE "ratings" ADD "ride_id" uuid`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "vehicle_type_id" uuid`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "rider_id" integer`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "driver_id" integer`);
    await queryRunner.query(`ALTER TABLE "rides" ADD "request_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD "ride_request_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD "driver_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_1137a9f7865d579e2b89afe692f" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_1c1ed1281a1bb3cfcc8b69dd107" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ratings" ADD CONSTRAINT "FK_c8816ffe28b4b32442e7beffe82" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_e9ac650f2f920e6a752f34d6915" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_d8ca08acdee36ad9774cbf1c57a" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_fb13184768dea9734b022874c6f" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rides" ADD CONSTRAINT "FK_eb9b79805e6a7b6b244d2ab58a3" FOREIGN KEY ("request_id") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_6da0aa23c21f2765578bfbf5e6c" FOREIGN KEY ("ride_request_id") REFERENCES "ride_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "FK_45245a5ff7c6b7dbd7d77bddf1c" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
