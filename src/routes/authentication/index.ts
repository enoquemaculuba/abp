import {FastifyInstance} from "fastify";
import {Token} from "../../@types/Types";

export default (app: FastifyInstance, options, done) => {
    /*app.route({
            method: 'GET',
            url: '/API/token',
            schema: {
                description: 'Get token',
                tags: ['code']
            },
            handler: async (req, res) => {
                const token = await res.jwtSign(<Token>{
                    role: ['admin'],
                }, { expiresIn: '30min'})
                res
                    .setCookie('token', token, {
                        path: '/',
                        secure: true,
                        httpOnly: true,
                        sameSite: true,
                        signed:true
                    })
                return {loggedIn: true}
            }
        })*/
        app.route({
            method: 'GET',
            url: '/API/verify',
            schema: {
                description: 'Verify token',
                tags: ['code']
            },
            preHandler: app.auth([app.verifyJWT]),
            handler: function (req, res) {
                res.send({success: true})
            }
        })
    done()
}
