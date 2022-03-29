import {FastifyInstance} from "fastify";
import {getUpcomingEvents} from "../../database/eventDatabase";
import {DatabaseResponse} from "../../@types/db";

export default (app: FastifyInstance, options, done) => {
    app.route({
        method: 'GET',
        url:'/API/upcoming-events',
        schema: {
            description:'Get upcoming events',
            tags:['text'],
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            return await getUpcomingEvents()
        }
    })
    done()
}
