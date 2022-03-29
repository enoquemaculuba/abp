import {FastifyInstance} from "fastify";
import events from "./events";
/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.register(events)
    done()
}