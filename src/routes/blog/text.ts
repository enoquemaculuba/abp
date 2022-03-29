import {FastifyInstance} from "fastify";
import {DatabaseResponse} from "../../@types/db";


export default (app: FastifyInstance, options, done) => {
    app.route({
        method: 'GET',
        url:'/API/text',
        schema: {
            description:'Get text',
            tags:['league'],
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            //TODO implement this
            return ''
        }
    })
    done()
}
