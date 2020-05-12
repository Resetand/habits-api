import { MigrationInterface, QueryRunner } from 'typeorm';
import { makeTypeOrmSql, SqlQuery } from 'src/utils/migrations';
import { config } from 'src/config';

export class Init1585521356637 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

        await this.createUser(sql);
        await this.createRooms(sql);
    }

    public async createRooms(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS rooms (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , name text NOT NULL
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;

        await sql`CREATE TABLE IF NOT EXISTS user_rooms (
            room_id uuid NOT NULL REFERENCES rooms(id) 
            , user_id uuid NOT NULL REFERENCES users(id) 
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
            , CONSTRAINT user_rooms_pkey PRIMARY KEY (room_id, user_id)
        )`;

        await sql`CREATE INDEX IF NOT EXISTS user_rooms_room_id_idx ON user_rooms (room_id)`;
        await sql`CREATE INDEX IF NOT EXISTS user_rooms_user_id_idx ON user_rooms (user_id)`;
    }

    public async createUser(sql: SqlQuery) {
        await sql`CREATE TABLE IF NOT EXISTS users (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
            , username TEXT NOT NULL UNIQUE
            , email TEXT NOT NULL UNIQUE
            , password TEXT NOT NULL
            , reset_password_token TEXT
            , reset_password_expires timestamptz
            , updated_at timestamptz NOT NULL DEFAULT now()
            , created_at timestamptz NOT NULL DEFAULT now()
        )`;

        await sql`CREATE INDEX IF NOT EXISTS username_idx ON users(username)`;

        await sql`INSERT INTO users (id, username, email, password) values (
            ${config.robot.id}, ${'robot'}, ${config.robot.email}, ${''}
        )`;
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        const sql = makeTypeOrmSql(queryRunner);

        await sql`DROP TABLE IF EXISTS users`;
        await sql`DROP TABLE IF EXISTS rooms`;
        await sql`DROP TABLE IF EXISTS user_rooms`;
    }
}
