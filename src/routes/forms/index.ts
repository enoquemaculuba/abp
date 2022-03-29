import {FastifyInstance} from "fastify";
import forms from "./forms";
/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.register(forms)
    done()
}