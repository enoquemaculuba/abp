import fastify, {FastifyInstance} from 'fastify'
import fastifyFormbody from 'fastify-formbody';
import helmet from 'fastify-helmet';
import fastifyJWT, {FastifyJWTOptions} from 'fastify-jwt';
import fastifyCookie from 'fastify-cookie'
import fastifySwagger from './utils/fastify_swagger';

import fastifyStatic from 'fastify-static'

import dotenv from 'dotenv';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { FastifyCookieOptions } from 'fastify-cookie'
import path from "path";

dotenv.config({ path: __dirname + '/../.env' });

const port = process.env.PORT || 3001;

const env = process.env.NODE_ENV || 'development';

const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(
    {
        logger: env==='development',
        trustProxy: true
    }
);
app.register(helmet, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: [`'self'`],
            styleSrc: [`'self'`, `'unsafe-inline'`],
            imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
            scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
    },
});

app.register(require('fastify-nodemailer'), {
    pool: true,
    host: process.env.SMTP_SERVER || '',
    port: process.env.SMTP_PORT || 0,
    secure: true,
    auth: {
        user: process.env.EMAIL || '',
        pass:  process.env.EMAIL_PASSWORD ||''
    },
    tls: {
        rejectUnauthorized: false
    }
})


app.register(fastifyJWT, {
    secret: 'secret',
    cookie: {
        cookieName: 'token',
        signed: true
    }
} as FastifyJWTOptions)

app.register(fastifyCookie, {secret: 'oepfp198198kh%#%&'} as FastifyCookieOptions)

app.register(fastifyFormbody);

if(env==='development'){
    app.register(fastifyStatic, {
        root: [path.join(__dirname, './static/frontend'), path.join(__dirname, './static/build')],
    })

    app.get('/dashboard*', (request:any, reply:any) => {
        return reply.sendFile('index.html', path.join(__dirname, './static/build'))
    })
}

app.register(fastifySwagger)


app.listen(port,  (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
