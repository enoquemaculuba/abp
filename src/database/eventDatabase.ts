import mysql from 'mysql';
import dotenv from "dotenv";
import {PoolQuery} from '../utils/misc'
dotenv.config();

const port:number = parseInt(<string>process.env.MYSQL_PORT,10) || 3001;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    multipleStatements: true,
    port: port,
    database: process.env.EVENT_DATABASE,
    debug: false,
    connectionLimit: 10
})

async function query(query: string, values: Array<Array<any>> = []): Promise<any> {
    return PoolQuery(pool, query, values)
}

export async function getUpcomingEvents(): Promise<any> {
    const q = `
        SELECT id, title, date, facebookUrl
        FROM ilmomasiina.EVENT
        WHERE date>=CURRENT_DATE
        ORDER BY date
    `
    return await query(q)
}