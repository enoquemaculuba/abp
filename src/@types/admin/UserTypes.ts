import {Static, Type} from "@sinclair/typebox";

export const UserQueryString = Type.Object({
    email:Type.String(),
    password:Type.String()
})


export const AddUserQueryString = Type.Object({
    name:Type.String(),
    email:Type.String(),
    password:Type.String()
})

export const LoginResponse = Type.Object({
    loggedIn:Type.Boolean(),
    error: Type.Optional(Type.String())
})


export type UserQueryStringType = Static<typeof UserQueryString>;

export type AddUserQueryStringType = Static<typeof AddUserQueryString>

export type LoginResponseType = Static<typeof LoginResponse>