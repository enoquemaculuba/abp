import {FastifyInstance} from "fastify";
import routes from "../routes/routes";
import dotenv from "dotenv";
import swagger from 'fastify-swagger';

dotenv.config();
const port = process.env.PORT || 3001;

const env = process.env.NODE_ENV || 'development';

export default (app: FastifyInstance, options, done) => {

    //allow documentation only in development
    if(env === 'development'){
        app.register(swagger, {
            routePrefix: '/documentation',
            swagger: {
                info: {
                    title: 'ABP backend test',
                    description: 'Testing abp backend api with the Fastify swagger API',
                    version: '0.1.0'
                },
                externalDocs: {
                    url: 'https://swagger.io',
                    description: 'Find more info here'
                },
                host: 'localhost:'+port,
                schemes: ['http'],
                consumes: ['application/json'],
                produces: ['application/json'],
                tags: [
                    { name: 'user', description: 'User related end-points' },
                    { name: 'code', description: 'Code related end-points' },
                    { name: 'blog', description: 'Blog related end-points' },
                    { name: 'league', description: 'League related end-points' },
                    { name: 'text', description: 'Text related end-points' },
                    { name: 'administration', description: 'Administration related end-points' },
                    { name: 'forms', description: 'Forms related end-points' }
                ],
                definitions: {
                    User: {
                        type: 'object',
                        required: ['id', 'email'],
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: {type: 'string', format: 'email' }
                        }
                    }
                },
                securityDefinitions: {
                    apiKey: {
                        type: 'apiKey',
                        name: 'apiKey',
                        in: 'header'
                    }
                }
            },
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false
            },
            uiHooks: {
                onRequest: function (request, reply, next) { next() },
                preHandler: function (request, reply, next) { next() }
            },
            staticCSP: true,
            transformStaticCSP: (header) => header,
            exposeRoute: true
        })

        app.ready(err => {
            if (err) throw err
            app.swagger()
        })
    }

    app.register(routes)

    done()
}
