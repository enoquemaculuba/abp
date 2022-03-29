import {query} from "./database";
import mysql from "mysql";

import {Administration, Personnel} from "../@types/administration";

export async function addAdministration(administration:Administration){
    const q = `
        INSERT INTO administration (name, role, year, telegram, other) 
        VALUES ?
        ON DUPLICATE KEY UPDATE 
            name= VALUES(name),
            role = VALUES(role),
            telegram = VALUES(telegram),
            other = VALUES(other)
    `;
    return await query(q, administration.map(x=>[x.name, x.role, x.year, x.telegram, x.other]));
}

export async function editAdministration(administration:Administration){
    if(administration.length==0)
        return false
    const year = administration[0]?.year;
    if(typeof year !== 'number')
        return false
    const q = `
        DELETE
        FROM administration
        WHERE year=${year}
    `;
    await query(q);
    const q2 = `
        INSERT INTO administration (name, role, year, telegram, other) 
        VALUES ?
        ON DUPLICATE KEY UPDATE 
            name= VALUES(name),
            role = VALUES(role),
            telegram = VALUES(telegram),
            other = VALUES(other)
    `;
    return await query(q2, administration.map(x=>[x.name, x.role, x.year, x.telegram, x.other]));
}


export async function addPersonToAdministration(person:Personnel){
    const q = `
        INSERT INTO administration (name, role, year, telegram, other) 
        VALUES ?
        ON DUPLICATE KEY UPDATE 
            name= VALUES(name),
            role = VALUES(role),
            telegram = VALUES(telegram),
            other = VALUES(other)
    `;
    return await query(q, [[person.name, person.role, person.year, person.telegram, person.other]])
}

export async function getPerson(person:Personnel){
    const q = `
       SELECT * 
       FROM administration
        WHERE name=${mysql.escape(person.name)} AND year=${mysql.escape(person.year)}
    `;
    return await query(q);
}

export async function getAdministration(year:number){
    const q = `
       SELECT * 
       FROM administration
        WHERE year=${mysql.escape(year)}
       ORDER BY role
    `;
    return await query(q);
}

export async function getAdministrations(){
    const q = `
       SELECT * 
       FROM administration
    `;
    return await query(q);
}

export async function getHallOfFame(){
    const year = new Date().getFullYear();
    const q = `
       SELECT name, role, year
       FROM administration
        WHERE year < ${year}
        ORDER BY role
    `;
    return await query(q);
}

export async function getCurrentAdministration(){
    const year = new Date().getFullYear();
    return await getAdministration(year)
}

export async function deleteAdministration(year:number){
    return await query(`
        DELETE
        FROM administration
        WHERE year=${mysql.escape(year)}
    `);
}
