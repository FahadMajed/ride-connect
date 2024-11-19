import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamedIds1732008002656 implements MigrationInterface {
    name = 'RenamedIds1732008002656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7"`);
        await queryRunner.query(`ALTER TABLE "rides" DROP CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a"`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" DROP CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8"`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" ADD CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ride_requests" DROP COLUMN "vehicleTypeId"`);
        await queryRunner.query(`ALTER TABLE "ride_requests" ADD "vehicleTypeId" integer`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "PK_4ecc9e77429fc6acdfea991b8bb"`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "PK_4ecc9e77429fc6acdfea991b8bb" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "vehicleTypeId"`);
        await queryRunner.query(`ALTER TABLE "rides" ADD "vehicleTypeId" integer`);
        await queryRunner.query(`ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rides" ADD CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rides" DROP CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a"`);
        await queryRunner.query(`ALTER TABLE "ride_requests" DROP CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7"`);
        await queryRunner.query(`ALTER TABLE "rides" DROP COLUMN "vehicleTypeId"`);
        await queryRunner.query(`ALTER TABLE "rides" ADD "vehicleTypeId" uuid`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" DROP CONSTRAINT "PK_4ecc9e77429fc6acdfea991b8bb"`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "ride_acceptance_statuses" ADD CONSTRAINT "PK_4ecc9e77429fc6acdfea991b8bb" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "ride_requests" DROP COLUMN "vehicleTypeId"`);
        await queryRunner.query(`ALTER TABLE "ride_requests" ADD "vehicleTypeId" uuid`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" DROP CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8"`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "vehicle_types" ADD CONSTRAINT "PK_73d1e40f4add7f4f6947acad3a8" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "rides" ADD CONSTRAINT "FK_7872a4979b8e9822cbe37d9299a" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ride_requests" ADD CONSTRAINT "FK_1837a8c187f052cf8e51ef0f3f7" FOREIGN KEY ("vehicleTypeId") REFERENCES "vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
