import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedResponseTime1732826689752 implements MigrationInterface {
    name = 'RemovedResponseTime1732826689752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ride_offers" DROP COLUMN "responseTime"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ride_offers" ADD "responseTime" TIMESTAMP NOT NULL`);
    }

}
