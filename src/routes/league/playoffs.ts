import {FastifyInstance} from "fastify";
import {DatabaseResponse, IdQueryString, IdQueryStringType} from "../../@types/db";
import * as LeagueDB from "../../database/leagueDB";
import * as Playoffs from "../../@types/league/PlayoffsTypes";
import * as querystring from "querystring";

/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.route<{Body:Playoffs.PlayoffsType}>({
        method:'POST',
        url:'/API/playoffs',
        schema:{
            description:'Add game to league or tournament',
            tags:['league'],
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {body} = req
            return await LeagueDB.editLeague(body)
        }
    })
    app.route<{Querystring:IdQueryStringType}>({
        method:'GET',
        url:'/API/playoffs',
        schema:{
            description:'Get playoff data by id',
            tags:['league'],
            querystring: IdQueryString,
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            const {id} = req.query
            return await LeagueDB.getPlayoffsData(id)
        }
    })
    app.route<{Body:Playoffs.PlayoffsType}>({
        method:'PUT',
        url:'/API/playoffs',
        schema:{
            description:'Edit game in league or tournament',
            tags:['league'],
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            //TODO implement this
            const {body} = req
            return {success: true}
        }
    })
    done()
}
