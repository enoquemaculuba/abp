import {FastifyInstance} from "fastify";
import * as League from "../../@types/league/LeagueTypes";
import * as LeagueDB from "../../database/leagueDB";
import {getLatestLeague, getLatestLeagueTeams, getLatestLeagueTeamsData} from "../../database/leagueDB";
import {DatabaseResponse} from "../../@types/db";
import {Type} from "@sinclair/typebox";

export default (app: FastifyInstance, options, done) => {
    app.route<{Querystring:League.LeagueQueryString}>({
            method:'GET',
            url:'/API/league',
            schema:{
                description: 'Get a league from database. If no ID or latest parameters are provided then all leagues are returned.',
                tags:['league'],
                querystring: League.LeagueQueryString,
                response: {
                    200: League.MultiLeagueResponse
                }
            },
            handler: async (req, res) => {
                const {id, latest} = req.query
                if(latest){
                    const data = await getLatestLeague();
                    if(!data.success||data.rows.length==0){
                        return data
                    }
                    const league = data.rows[0]
                    const playoffs = await LeagueDB.getPlayoffsData(league.leagueID)
                    return {
                        league: {
                            name: league.name,
                            playoffs: Boolean(league.playoffs),
                            playoffTeams: league.playoffTeams
                        },
                        playoffs: playoffs.rows
                    }
                }else if(id){
                    const league = await LeagueDB.getLeagueById(id)
                    const games = await LeagueDB.getGamesById(id)
                    const  playoffs = await LeagueDB.getPlayoffsData(id)
                    const  playerStats = await LeagueDB.getPlayersTableData(id)
                    const response: League.SingleLeagueResponseType = {
                        league: league.rows[0],
                        success: league.success,
                        error: league.error,
                        games: games.rows,
                        playoffs: playoffs.rows,
                        playerStats: playerStats.rows
                    }
                    return response
                }
                return await LeagueDB.getLeagues()
            }
        }
    )

    app.route<{Body:League.LeaguePOSTType}>({
        method: 'POST',
        url: '/API/league',
        schema: {
            description:'Add league to database',
            tags:['league'],
            body: League.LeaguePOST,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {name, teams} = req.body
            const response = await LeagueDB.addLeague(name)
            const leagueID = await LeagueDB.getLastID()
            if(!response.success){
                return response
            }
            if(teams !== undefined){
                return await LeagueDB.addLeagueTeams(leagueID, teams)
            }
            return response
        }
    })
    app.route<{Body:League.TeamsPOSTType}>({
        method: 'POST',
        url: '/API/teams',
        schema: {
            description:'Edit teams',
            tags:['league'],
            body: League.TeamsPOST,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {id, teams} = req.body
            return await LeagueDB.addLeagueTeams(id, teams)
        }
    })
    app.route<{Querystring:{id:number}}>({
        method:'GET',
        url: '/API/teams',
        schema:{
            description: 'Get teams',
            tags:['league'],
            querystring: {
                type:'object',
                properties:{
                    id:{
                        type:'number'
                    }
                }
            },
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            const {id} = req.query
            return await LeagueDB.getTeams(id)
        }
    })
    app.route<{Querystring:League.TeamGETType}>({
        method:'GET',
        url: '/API/team',
        schema:{
            description: 'Get team',
            tags:['league'],
            querystring:League.TeamGET,
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            const {name, id} = req.query
            return await LeagueDB.getTeam(id, name)
        }
    })
    app.route<{Body:League.TeamPUTType}>({
        method:'PUT',
        url: '/API/team',
        schema:{
            description: 'Edit team',
            tags:['league'],
            body: League.TeamPUT,
            response: {
                200: Type.Boolean()
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {id, team, oldTeam} = req.body
            return await LeagueDB.editTeam(team, oldTeam, id)
        }
    })
    app.route<{Querystring:League.TeamGETType}>({
        method:'DELETE',
        url: '/API/team',
        schema:{
            description: 'delete team',
            tags:['league'],
            querystring: League.TeamGET,
            response: {
                200: Type.Boolean()
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {id, name} = req.query
            return await LeagueDB.deleteTeam(name, id)
        }
    })
    app.route<{Body:League.LeaguePUTType}>({
        method:'PUT',
        url: '/API/league',
        schema:{
            description: 'Edit league in database',
            tags:['league'],
            body:League.LeaguePUT,
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
    app.route<{Querystring:League.LeagueDeleteQueryString}>({
        method:'DELETE',
        url: '/API/league',
        schema:{
            description: 'Delete league',
            tags:['league'],
            querystring:League.LeagueDeleteQueryString,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {id} = req.query
            return await LeagueDB.deleteLeagueById(id)
        }
    })

    app.route({
        method:'GET',
        url: '/API/league-latest-standings',
        schema:{
            description: 'Get standings',
            tags:['league'],
            response: {
                200: Type.Object({
                    teams: Type.Array(Type.Any()),
                    games: Type.Array(Type.Any())
                })
            }
        },
        handler: async (req, res) => {

            return await LeagueDB.getLatestLeagueTeams()
        }
    })
    app.route({
        method:'GET',
        url: '/API/latest-league-teams-data',
        schema:{
            description: 'Newest league teams data',
            tags:['league'],
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            return await LeagueDB.getLatestLeagueTeamsData()
        }
    })
    app.route({
        method:'GET',
        url: '/API/latest-league-player-data',
        schema:{
            description: 'Newest league player data',
            tags:['league'],
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            return await LeagueDB.getLatestPlayersData()
        }
    })

    done()
}
