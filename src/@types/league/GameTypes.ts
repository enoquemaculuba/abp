import {Static, Type} from '@sinclair/typebox'
import {TeamScore} from "./TeamTypes";

export const Game = Type.Object({
    leagueID: Type.Number(),
    winner: TeamScore,
    loser: TeamScore
})
export type GameType = Static<typeof Game>

export const match = Type.Object({
    team1: Type.String(),
    team2: Type.String(),
    team1score: Type.Number(),
    team2score: Type.Number(),
    round: Type.Number(),
    slot: Type.Number(),
})

export type Match = Static<typeof match>

export const leagueGame = Type.Intersect([
    Game,
    Type.Object({
        isInPlayoffs: Type.Boolean(),
        match: match
    })])

export type LeagueGame = Static<typeof leagueGame>


export const PlayerStat = Type.Object({
    cups: Type.Number(),
    leagueID: Type.Number(),
    oppositeteam: Type.String(),
    name: Type.String(),
})

export type PlayerStat = Static<typeof PlayerStat>

export const IdQueryString = Type.Object({
    id: Type.Number()
})
export type IdQueryStringType = Static<typeof IdQueryString>

const league = Type.Object({
    name: Type.String(),
    id: Type.Optional(Type.Number()),
    playoffs: Type.Boolean(),
    playoffTeams: Type.Number(),
    teamsAmount: Type.Number()
})


export const leagueGames = Type.Object({
    teams: Type.Array(Type.Any()),
    playoffs: Type.Array(Type.Any()),
    league: league,
    games: Type.Optional(Type.Array(Type.Any()))
})

export type LeagueGames = Static<typeof leagueGames>
export type League = Static<typeof league>

