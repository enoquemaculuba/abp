import mysql from "mysql";
import {addToTable, query} from "./database";

/**
 * Add text to database
 *
 * @param id
 * @param text
 */
export async function addText(id:string, text:string){
    const q:string = `
    INSERT INTO texts (ID, content) 
    VALUES ?
    ON DUPLICATE KEY UPDATE 
        content = VALUES(content)
    `;
    return await addToTable(q, [[id, text]])
}

/**
 * Get text by id
 *
 * @param id
 */
export async function getText(id:string){
    const q:string = `
    SELECT content
    FROM texts
    WHERE ID=${mysql.escape(id)};
    `
    return await query(q);
}

/**
 * Delete text from database
 *
 * @param id
 */
export async function deleteText(id:string){
    return await query(`
    DELETE
    FROM texts
    WHERE ID=${mysql.escape(id)};
    `);
}
