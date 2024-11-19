import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedPayments1732008160182 implements MigrationInterface {
  name = 'AddedPayments1732008160182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payments_paymentstatus_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "paymentStatus" "public"."payments_paymentstatus_enum" NOT NULL DEFAULT 'pending', "paymentMethod" character varying NOT NULL, "transactionId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "rideId" integer, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_methods_methodtype_enum" AS ENUM('credit_card', 'debit_card')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_methods_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_methods" ("id" SERIAL NOT NULL, "methodType" "public"."payment_methods_methodtype_enum" NOT NULL, "cardNumber" character varying NOT NULL, "expiryDate" TIMESTAMP NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "status" "public"."payment_methods_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "riderId" integer, CONSTRAINT "PK_34f9b8c6dfb4ac3559f7e2820d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_e979c43b9a5f2bcfb69ee795a6a" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_4dcf93123616b82f3db541d6039" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_4dcf93123616b82f3db541d6039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_e979c43b9a5f2bcfb69ee795a6a"`,
    );
    await queryRunner.query(`DROP TABLE "payment_methods"`);
    await queryRunner.query(`DROP TYPE "public"."payment_methods_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."payment_methods_methodtype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_paymentstatus_enum"`);
  }
}
