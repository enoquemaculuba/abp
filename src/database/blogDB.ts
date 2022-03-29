import {addToTable, query} from "./database";
import mysql from "mysql";

/**
 * Add blog to database
 *
 * @param data
 */
export async function addBlog(data:{title:string, writer:string, text:string}){
    const q:string = `
    INSERT INTO blog (title, writer, text) 
    VALUES ?
    ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        writer = VALUES(writer),
        text = VALUES(text)
    `;
    return await addToTable(q, [[data.title, data.writer, data.text]])
}

/**
 * Edit blog in database
 *
 * @param data
 */
export async function editBlog(data:{title:string, writer:string, text:string, id:number}){
    const q:string = `
    UPDATE blog
    set title=${mysql.escape(data.title)},  
        writer=${mysql.escape(data.writer)},
        text=${mysql.escape(data.text)}
    WHERE id=${mysql.escape(data.id)};
    `
    return await query(q);
}

/**
 * Delete the blog from the database
 *
 * @param id
 */
export async function deleteBlog(id:number){
    const q:string = `
    DELETE 
    FROM blog
    WHERE id=${mysql.escape(id)};
    `
    return await query(q);
}

/**
 * Get blog by id
 *
 * @param id
 */
export async function getBlog(id:number){
    const q:string = `
    SELECT *
    FROM blog
    WHERE id=${mysql.escape(id)};
    `
    return await query(q);
}

/**
 * Get all the blogs
 */
export async function getAllBlogs(){
    const q:string = `
    SELECT *
    FROM blog
    ORDER BY id;
    `
    return await query(q);
}

/**
 * Get the latest n blogs
 *
 * @param n
 */
export async function getNLatestBlogs(n:number){
    const q:string = `
    SELECT *
    FROM blog
    ORDER BY id
    LIMIT ${mysql.escape(n)}
    `
    return await query(q);
}

/**
 * Get blogs with limit
 *
 * @param start
 * @param end
 */
export async function getBlogsInRange(start:number, end:number){
    const blogAmount = `
        SELECT COUNT(id) as amount
        FROM blog
    `
    const amount = (await query(blogAmount)).rows[0]?.amount ?? 0

    const q:string = `
        SELECT *
        FROM blog
        ORDER BY dateTime DESC
        LIMIT ${mysql.escape(start)},${mysql.escape(end)}

    `
    return {...await query(q), amount:amount};
}
