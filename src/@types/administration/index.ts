import { Static, Type } from '@sinclair/typebox'

export const personnel = Type.Object({
    name:Type.String(),
    role: Type.String(),
    year: Type.Number(),
    telegram: Type.Optional(Type.String()),
    other: Type.Optional(Type.String())
});


export const administration = Type.Array(personnel);


export type Personnel = Static<typeof personnel>;

export type Administration = Static<typeof administration>;