import {FastifyInstance} from "fastify";
import * as Blog from "../../@types/blog/BlogType";
import * as BlogDB from "../../database/blogDB";
import {DatabaseResponse} from "../../@types/db";
import {Type} from "@sinclair/typebox";
import {BlogResponse} from "../../@types/blog/BlogType";

/**
 * Route for handling blog related requests.
 * Methods: GET, POST, DELETE
 *
 * @param app
 * @param options
 * @param done
 */
export default (app: FastifyInstance, options, done) => {
    app.route<Blog.BlogRequest>({
        method:'GET',
        url: '/API/blog',
        schema: {
            description: 'Get blogs in rows. Returns all if no query parameter amount is provided. Else returns the amount requested. Get single blog by submitting ID.',
            tags: ['blog'],
            querystring: Blog.BlogQueryString,
            response: {
                200: Blog.BlogResponse
            }
        },
        handler: async (req, reply) => {
            const {amount,id} = req.query;
            if(id){
                return await BlogDB.getBlog(id);
            }
            else if (amount) {
                return await BlogDB.getNLatestBlogs(amount)
            }else{
                return await BlogDB.getAllBlogs()
            }
        }
    })
    app.route<{Querystring:{start:number, amount:number}}>({
        method:'GET',
        url: '/API/blogs',
        schema: {
            description: 'Get blogs with limit.',
            tags: ['blog'],
            querystring: Type.Object({
                start:Type.Number(),
                amount:Type.Number()
            }),
            response: {
                200: Type.Intersect([BlogResponse,Type.Object({amount:Type.Number()})])
            }
        },
        handler: async (req, reply) => {
            const {start, amount} = req.query;
            return await BlogDB.getBlogsInRange(start, amount)
        }
    })

    app.route<{Body:Blog.BlogPostType}>({
        method:'POST',
        url: '/API/blog',
        schema: {
            description: 'Add blog to database. If id is given then edit blog',
            tags: ['blog'],
            body: Blog.BlogPost,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, reply) => {
            const data: {title, writer, text, id?} = req.body;
            if(data.id){
                return await BlogDB.editBlog({...data, id: data.id})
            }else{
                return await BlogDB.addBlog(data)
            }

        }
    })

    app.route<Blog.BlogRequest>({
        method:'DELETE',
        url: '/API/blog',
        schema: {
            description: "Delete blog",
            tags: ['blog'],
            querystring:Blog.BlogDeleteQueryString,
            response: {
                200: DatabaseResponse
            }
        },
        preHandler: app.auth([app.verifyJWT]),
        handler: async (req, reply) => {
            const {id} = req.query;
            return await BlogDB.deleteBlog(id)
        }
    })

    done()
}
