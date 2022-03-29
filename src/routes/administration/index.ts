import {FastifyInstance} from "fastify";
import administration from './administration'
/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.register(administration)
    done()
}