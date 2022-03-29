import { Static, Type } from '@sinclair/typebox'

export const Event = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    date: Type.String(),
    facebookUrl: Type.Union([Type.String(), Type.Null()])
});
export type EventType = Static<typeof Event>;

export const Events = Type.Array(Event)
export type EventsType = Static<typeof Events>;