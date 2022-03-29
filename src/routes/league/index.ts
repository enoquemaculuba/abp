import {FastifyInstance} from "fastify";
import leagueRoute from './league'
import gameRoute from './game'
import playoffsRoute from './playoffs'

/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.register(leagueRoute)
    app.register(gameRoute)
    app.register(playoffsRoute)
    done()
}