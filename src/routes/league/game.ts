import {FastifyInstance} from "fastify";
import * as Game from "../../@types/league/GameTypes";
import {DatabaseResponse, IdQueryStringType} from "../../@types/db";
import * as LeagueDB from "../../database/leagueDB";
import {addGameToLeague, getDataForAddGame} from "../../database/leagueDB";
import {Type} from "@sinclair/typebox";

/**
 * Route for handling league related requests.
 *
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.route<{Body:Game.LeagueGame}>({
        method:'POST',
        url:'/API/game',
        schema:{
            description:'Add game to league or tournament',
            tags:['league'],
            body: Game.leagueGame,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {body} = req
            return await LeagueDB.addGameToLeague(body)
        }
    })
    app.route<{Querystring:Game.IdQueryStringType}>({
        method:'GET',
        url:'/API/game',
        schema:{
            description:'Get all games in league',
            tags:['league'],
            querystring: Game.IdQueryString,
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            const {id} = req.query
            return await LeagueDB.getGamesById(id)
        }
    })
    app.route<{Body:Game.GameType}>({
        method:'PUT',
        url:'/API/game',
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
    app.route<{Body:{match:Game.Match, id:number}}>({
        method:'PUT',
        url:'/API/playoff',
        schema:{
            description:'Edit game in league or tournament',
            tags:['league'],
            body: {
                type:'object',
                properties:{
                    match:Game.match,
                    id:{
                        type:'number'
                    }
                }
            },
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {match, id} = req.body
            return await LeagueDB.editPlayoffGame(match, id)
        }
    })
    app.route<{Querystring:Game.IdQueryStringType}>({
        method:'GET',
        url:'/API/games',
        schema:{
            description:'Get game data',
            tags:['league'],
            querystring: Game.IdQueryString,
            response: {
                200: Game.leagueGames
            }
        },
        handler: async (req, res) => {
            const {id} = req.query
            return await LeagueDB.getDataForAddGame(id)
        }
    })
    app.route<{Params:{id:string}}>({
        method:'GET',
        url:'/API/games/:id',
        schema:{
            description:'Get game data',
            tags:['league'],
            params: Type.Object({id:Type.String()}),
            response: {
                200: Game.leagueGames
            }
        },
        handler: async (req, res) => {
            const {id} = req.params
            console.log(id)
            return await LeagueDB.getDataForAddGameByPass(id)
        }
    })

    done()
}
