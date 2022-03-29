
import {createDatabase, createTables} from './database'

/**
 * Init database
 */
createDatabase().then(()=>{
    console.log('database created')
    createTables().then(()=>{
        console.log('tables created')
        process.exit(1)
    }).catch((e)=>{
        console.log('Error:', e)
        process.exit(1)
    })
}).catch((e)=>{
    console.log('Error:', e)
    process.exit(1)
})

