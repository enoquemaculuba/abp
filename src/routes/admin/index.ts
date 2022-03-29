import {FastifyInstance} from "fastify";
import {DatabaseResponse} from "../../@types/db";
import {
    AddUserQueryString,
    AddUserQueryStringType, LoginResponse, LoginResponseType,
    UserQueryString,
    UserQueryStringType
} from "../../@types/admin/UserTypes";
import bcrypt from 'bcrypt'
import {addUser, getUser} from "../../database/database";
import {Token} from "../../@types/Types";

const saltRounds = 10;

export default (app: FastifyInstance, options, done) => {
    app.route<{Body:AddUserQueryStringType}>({
        method: 'POST',
        url:'/API/user',
        schema: {
            description:'Add user to database',
            tags:['user'],
            body: AddUserQueryString,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {body} = req
            const hash = await bcrypt.hash(body.password, saltRounds)
            return await addUser({...body, password: hash})
        }
    })
    app.route<{Body:UserQueryStringType}>({
      method:'GET',
            url:'/API/logout',
        schema:{
            description:'Logout',
            tags:['user'],
            response: {
                200: LoginResponse
            }
        }, handler: (req, res) => {
            res.clearCookie('token').status(200).send({loggedIn:false})
        }
    })
    app.route<{Body:UserQueryStringType}>({
        method: 'POST',
        url:'/API/login',
        schema: {
            description:'Login',
            tags:['user'],
            body: UserQueryString,
            response: {
                200: LoginResponse
            }
        },
        handler: async (req, res) => {
            const {body} = req
            const response = await getUser(body.email)
            if(response.rows.length==0){
                response.error = {message: 'Invalid email address'}
            }
            if(response.error||!response.success) {
                return {loggedIn:false, error:response.error?.message}
            }
            const hash = response.rows[0]?.password
            if(hash){
                const isUser = await bcrypt.compare(body.password, hash)
                if(isUser){
                    const token = await res.jwtSign(<Token>{
                        role: ['admin'],
                    }, { expiresIn: '10min'})
                    res.setCookie('token', token, {
                            path: '/',
                            secure: true,
                            httpOnly: true,
                            sameSite: true,
                            signed:true
                        })
                    return {loggedIn: true}
                }
            }
            return {loggedIn: false, error:'Invalid password'}
        }
    })

    done()
}
