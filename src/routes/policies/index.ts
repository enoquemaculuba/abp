import {FastifyInstance} from "fastify";
import textRoutes from "./text";
/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.register(textRoutes)
    done()
}