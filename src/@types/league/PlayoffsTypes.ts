import {Static, Type} from '@sinclair/typebox'

export const PlayoffGame = Type.Object({
    leagueID:Type.Number(),
    winner: Type.String(),
    loser: Type.String(),
})

export type PlayoffGameType = Static<typeof PlayoffGame>

const Playoffs = Type.Object({
    id:Type.Number(),
    inPlayoffs: Type.Boolean({description:'Is the league in playoffs'}),
    playoffsTeamsAmount: Type.Number({description:'Amount of teams to advance to playoffs'})
})

export type  PlayoffsType = Static<typeof Playoffs>