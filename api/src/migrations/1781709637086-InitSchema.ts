import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1781709637086 implements MigrationInterface {
    name = 'InitSchema1781709637086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "todos" ("id" varchar PRIMARY KEY NOT NULL, "title" varchar NOT NULL, "notes" varchar, "completed" boolean NOT NULL DEFAULT (0), "priority" varchar NOT NULL DEFAULT ('medium'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "todos"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
