import {FastifyInstance} from "fastify";
import {DatabaseResponse} from "../../@types/db";
import {
    addAdministration, deleteAdministration,
    editAdministration,
    getAdministration,
    getCurrentAdministration, getHallOfFame
} from "../../database/administartionDB";
import * as administration from "../../@types/administration";

export default (app: FastifyInstance, options, done) => {
    app.route({
        method: 'GET',
        url:'/API/hall-of-fame',
        schema: {
            description:'Get hall of fame',
            tags:['administration'],
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            return await getHallOfFame();
        }
    })
    app.route<{Querystring:{year: number}}>({
        method: 'GET',
        url:'/API/administration',
        schema: {
            description:'Get administration',
            tags:['administration'],
            querystring: {
                type: 'object',
                properties:{
                    year: {
                        type:'number'
                    }
                }
            },
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            const {year} = req.query;
            return await getAdministration(year);
        }
    })
    app.route({
        method: 'GET',
        url:'/API/current-administration',
        schema: {
            description:'Get current administration',
            tags:['administration'],
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            return await getCurrentAdministration();
        }
    })
    app.route<{Body:administration.Administration}>({
        method: 'POST',
        url:'/API/administration',
        schema: {
            description:'Add administration',
            tags:['administration'],
            body: administration.administration,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {body} = req;
            return await addAdministration(body);
        }
    })
    app.route<{Body:administration.Administration}>({
        method: 'PUT',
        url:'/API/administration',
        schema: {
            description:'Edit administration',
            tags:['administration'],
            body: administration.administration,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {body} = req;
            return await editAdministration(body);
        }
    })
    app.route<{Querystring:{year: number}}>({
        method: 'DELETE',
        url:'/API/administration',
        schema: {
            description:'Delete administration',
            tags:['administration'],
            querystring: {
                type: 'object',
                properties:{
                    year: {
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
            const {year} = req.query;
            return await deleteAdministration(year);
        }
    })

    done()
}