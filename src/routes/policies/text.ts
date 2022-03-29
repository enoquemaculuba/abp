import {FastifyInstance} from "fastify";
import {DatabaseResponse} from "../../@types/db";
import {addText, deleteText, getText} from "../../database/textDB";

export default (app: FastifyInstance, options, done) => {
    app.route<{Body:{id: string, text:string}}>({
        method: 'POST',
        url:'/API/text',
        schema: {
            description:'Add text',
            tags:['text'],
            body: {
                type: 'object',
                properties:{
                    id: {
                        type:'string'
                    },
                    text:{
                        type:'string'
                    }
                }
            },
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {id, text} = req.body;
            return await addText(id, text);
        }
    })
    app.route<{Querystring:{id: string}}>({
        method: 'GET',
        url:'/API/text',
        schema: {
            description:'Get policy text',
            tags:['text'],
            querystring: {
                type: 'object',
                properties:{
                    id: {
                        type:'string'
                    }
                }
            },
            response: {
                200: DatabaseResponse
            }
        },
        handler: async (req, res) => {
            const {id} = req.query;
            return await getText(id);
        }
    })
    app.route<{Querystring:{id: string}}>({
        method: 'DELETE',
        url:'/API/text',
        schema: {
            description:'Get policy text',
            tags:['text'],
            querystring: {
                type: 'object',
                properties:{
                    id: {
                        type:'string'
                    }
                }
            },
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, res) => {
            const {id} = req.query;
            return await deleteText(id);
        }
    })
    done()
}