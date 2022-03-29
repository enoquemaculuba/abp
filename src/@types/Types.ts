import {DecodePayloadType} from "fastify-jwt";

//TODO simplify all types

declare module "fastify" {
    interface FastifyInstance {
        verifyJWT(): void;
        verifyUserAndPassword(): void;
        nodemailer: any
    }
}

export  type MySQLError = {
    success: boolean,
    error?: string
}

export interface MySqlErrorHandling {
    success: boolean;
    error?: { message: string };
}

export type Token = {
    role: Array<string>
}

export type DecodedToken = Token & DecodePayloadType | null
