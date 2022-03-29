import {FastifyInstance} from "fastify";
import leagueRoute from "./league";
import eventsRoute from "./events";
import blogsRoute from "./blog";
import adminRoute from "./admin"
import authenticationRoute from './authentication'
import policyRoute from './policies'
import administrationRoute from './administration'
import formsRoute from './forms'
import FastifyAuth from "fastify-auth";

import {verifyJWT, verifyUserAndPassword} from '../services/authentication'

export default (app: FastifyInstance, options, done) => {
    app.decorate('verifyJWT', verifyJWT)
        .decorate('verifyUserAndPassword', verifyUserAndPassword)
        .register(FastifyAuth).after(() => {
            app.register(authenticationRoute)
            app.register(leagueRoute)
            app.register(eventsRoute)
            app.register(blogsRoute)
            app.register(adminRoute)
            app.register(administrationRoute)
            app.register(policyRoute)
            app.register(formsRoute)
        })

    done()
}
