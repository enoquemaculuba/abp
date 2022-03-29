import bcrypt from "bcrypt";
import {addUser} from "./database";
import dotenv from "dotenv";


const saltRounds = 10;

dotenv.config({ path: __dirname + '/../../.env' });

/**
 * Init admin for backend
 *
 * @param password
 * @param name
 * @param email
 */
async function run(password, name, email){
    const hash = await bcrypt.hash(password, saltRounds)
    const response = await addUser({name:name, password:hash, email:email})
    if(response.success){
        console.log('user added')
    }else{
        console.log('user not added')
    }

    process.exit(1)
}

run(process.env.ADMIN_NAME, process.env.ADMIN_EMAIL_PASSWORD, process.env.ADMIN_EMAIL)
