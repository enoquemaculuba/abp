import {FastifyReply, FastifyRequest} from "fastify";

export async function verifyJWT(request:FastifyRequest, reply:FastifyReply, done) {
    await request.jwtVerify()
    done()
}

export async function verifyUserAndPassword(request:FastifyRequest, reply:FastifyReply, done) {
    done()
}
