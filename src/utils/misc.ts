import mysql from "mysql";
import {MySQLError} from "../@types/Types";
import {QueryResponse, QueryResult} from "../@types/db";

export function shuffle<T>(array:Array<T>) {
    let currentIndex = array.length,  randomIndex:number;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function getPairs<T>(arr:Array<T>):Array<Array<T>>{
    let result:Array<Array<T>> = [];
    for(let i = 0; i < arr.length; i += 2)
    {
        result.push(arr.slice(i, i + 2));
    }
    return result
}


export async function PoolQuery(pool:mysql.Pool, query: string, values: Array<Array<any>> = []): Promise<QueryResponse> {
    const getError = (err) =>{
        return {rows:[], success: false, error: {message: `Error: ${err.code} ${err.sqlMessage}`}}
    }

    return new Promise<QueryResponse>((resolve) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                resolve(getError(err))
            }
            connection.query(query, [values], function (err, results) {
                connection.release();
                if (results?.constructor?.name == 'OkPacket') {
                    resolve({rows:[],success: true})
                }
                if (!err) {
                    resolve({success: true, rows: results});
                } else {
                    resolve(getError(err))
                }
            });
            connection.on('error', function (err) {
                resolve(getError(err))
            });
        });
    })
}