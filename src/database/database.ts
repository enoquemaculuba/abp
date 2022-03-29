/**
 * Database handling
 * Check leagueDB.test.ts for creating database, tables, etc.
 */

import mysql from 'mysql';
import dotenv from "dotenv";
import {PoolQuery} from "../utils/misc";
import {AddUserQueryStringType} from "../@types/admin/UserTypes";

dotenv.config();

const port: number = parseInt(<string>process.env.MYSQL_PORT, 10) || 3001;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true,
    port: port,
    database: process.env.MYSQL_DATABASE,
    debug: false,
    connectionLimit: 10
});

/**
 * Create database if database does not exist
 *
 * @return True if database exists or database created
 */
export async function createDatabase() {
    const q = `CREATE DATABASE IF NOT EXISTS abp_website`;
    return query(q)
}

/**
 * Create tables in mysql database
 *
 * @returns {true} if all tables were created
 *
 */
export async function createTables() {
    const league: string = `
        CREATE TABLE if NOT EXISTS league
        (
            leagueID INT AUTO_INCREMENT PRIMARY KEY,
            NAME     VARCHAR(255),
            password VARCHAR(255),
            dateTime datetime DEFAULT CURRENT_TIMESTAMP,
            playoffs     tinyint(1) default 0                   not null,
            playoffTeams int        default 0                   not null
        )`;
    const player: string = `
        CREATE TABLE if NOT EXISTS player
        (
            leagueID  INT,
            teamName  VARCHAR(255),
            name VARCHAR(255),
            PRIMARY KEY (leagueID, name)
        )`;
    const game: string = `
        CREATE TABLE if NOT EXISTS game
        (
            leagueID    INT,
            winningTeam VARCHAR(255),
            losingTeam  VARCHAR(255),
            leftCups    INT,
            PRIMARY KEY (leagueID, winningTeam, losingTeam)
        )`;
    const playerStat: string = `
        CREATE TABLE if NOT EXISTS playerStat
        (
            cups         INT,
            leagueID     INT,
            oppositeTeam VARCHAR(255),
            name    VARCHAR(255),
            team    VARCHAR(255),
            PRIMARY KEY (leagueID, oppositeTeam, name, team)
        )`;
    const administration: string = `
        CREATE TABLE if NOT EXISTS administration
        (
            name     VARCHAR(255),
            role     VARCHAR(255),
            year     INT,
            telegram VARCHAR(255),
            other    VARCHAR(255),
            PRIMARY KEY (name, year, role)
        )`;
    const blog: string = `
        CREATE TABLE if NOT EXISTS blog
        (
            id       INT AUTO_INCREMENT PRIMARY KEY,
            title    VARCHAR(255),
            writer   VARCHAR(255),
            text     LONGTEXT,
            dateTime datetime DEFAULT CURRENT_TIMESTAMP
        )`;
    const texts: string = `
        CREATE TABLE if NOT EXISTS blog
        (
            ID      VARCHAR(255) NOT NULL PRIMARY KEY,
            content LONGTEXT
        )`;
    const playoffs: string = `
        CREATE TABLE if NOT EXISTS playoffs
        (
            ID         int           not null,
            team1      varchar(255)  not null,
            team2      varchar(255)  not null,
            team1score int default 0 null,
            team2score int default 0 null,
            round      int           not null,
            slot      int           not null,
            PRIMARY KEY (ID, round, slot)
        );

    `
    const permissions = `
        CREATE TABLE if NOT EXISTS permissions
(
    user_id    int          not null,
    permission varchar(255) not null,
    primary key (user_id, permission)
);
    `
    const user = `CREATE TABLE if NOT EXISTS user
(
    id        int auto_increment primary key,
    name      varchar(255)               not null,
    createdAt datetime default curdate() not null,
    editedAt  datetime                   null,
    password  text                       not null,
    email     varchar(255)               not null,
    constraint user_email_uindex unique (email)
);`
    const queries: string = [league, player, game, playerStat, administration, blog, texts, playoffs, permissions, user].join(";");
    return query(queries)

}


/**
 * Get the last added id (AUTO_INCREMENT)
 */
export async function getLastID(): Promise<number> {
   let result = await query("SELECT LAST_INSERT_ID() AS id");
    if (result == null || result[0].id == null) {
        throw new Error('Not a number');
    }
    return result[0].id;
}


/**
 * Database query. Use this to add or edit table
 *
 * @param query
 * @param values
 * @return True if query was successful
 */
export async function query(query: string, values: Array<Array<any>> = []) {
    return await PoolQuery(pool, query, values)
}

/**
 * Add data to table
 *
 * @param options  QueryOptions
 * @param values values to be added
 * @return True if added successfully
 */
export async function addToTable(options: string, values: any) {
    return await query(options, values)
}

export async function addUser(user: AddUserQueryStringType) {
    return await query(`INSERT INTO user (name, password, email)
                        VALUES ?`, [[user.name, user.password, user.email]])
}

export async function getUser(email: string) {
    return await query(`SELECT *
                        FROM user
                        WHERE email = ${mysql.escape(email)}`)
}
