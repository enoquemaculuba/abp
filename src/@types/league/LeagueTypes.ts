import {Static, Type} from '@sinclair/typebox'
import {Team} from "./TeamTypes";
import {Game, PlayerStat} from "./GameTypes";
import {PlayoffGame} from "./PlayoffsTypes";
import playoffs from "../../routes/league/playoffs";

const League = Type.Object({
    leagueID: Type.Number(),
    name: Type.String(),
    password:Type.String(),
    dateTime: Type.String(),
    playoffs: Type.Boolean(),
    playoffTeams: Type.Number()
})

export const LeaguePOST = Type.Object({
    name: Type.String({description: 'Name of the league'}),
    teams: Type.Optional(Type.Array(Team, {description: 'Teams of the league'})),
})
export type LeaguePOSTType = Static<typeof LeaguePOST>

export const TeamsPOST = Type.Object({
    id: Type.Number({description: 'ID of the league'}),
    teams: Type.Array(Team, {description: 'Teams of the league'}),
})
export type TeamsPOSTType = Static<typeof TeamsPOST>

export const LeaguePUT = Type.Object(
    {
        id: Type.Number({description:'ID of the league'}),
        name: Type.Optional(Type.String({description:'New name of the league'})),
        inPlayoffs: Type.Optional(Type.Boolean({description:'Is the league in playoffs'})),
        playoffsTeamsAmount: Type.Optional(Type.Number({description:'Amount of teams to advance to playoffs'}))
    }
)
export type LeaguePUTType = Static<typeof LeaguePUT>

export const LeagueQueryString =Type.Object({
    id: Type.Optional(Type.Number({description:'Id of the league to get'})),
    latest: Type.Optional(Type.Boolean({description:'Should get the latest league?'}))
})
export type LeagueQueryString = Static<typeof LeagueQueryString>

export const LeagueDeleteQueryString = Type.Object({
    id: Type.Number({description:'ID of the league to be removed'}),
})
export type LeagueDeleteQueryString = Static<typeof LeagueDeleteQueryString>

export const LeagueResponse = Type.Object({
    rows: Type.Array(League),
    success: Type.Boolean(),
    error: Type.Optional(Type.Object({message:Type.String()}))
});


const PlayerTableData = Type.Object({
    name: Type.String(),
    teamName: Type.String(),
    cups: Type.Number(),
    games: Type.Number()
})

export const SingleLeagueResponse = Type.Object({
    league:League,
    games: Type.Array(Game),
    playoffs: Type.Array(PlayoffGame),
    playerStats: Type.Array(PlayerTableData),
    success: Type.Boolean(),
    error: Type.Optional(Type.Object({message:Type.String()}))
});

export type SingleLeagueResponseType = Static<typeof SingleLeagueResponse>

export const LatestLeagueResponse = Type.Object({
    league:Type.Object({
        name:Type.String(),
        playoffs: Type.Boolean(),
        playoffTeams:Type.Number()
    }),
    playoffs: Type.Array(PlayoffGame)
})

export const MultiLeagueResponse = Type.Union([LeagueResponse, SingleLeagueResponse, LatestLeagueResponse])

export const TeamGET = Type.Object({
    name:Type.String(),
    id: Type.Number()
})

export type TeamGETType = Static<typeof TeamGET>

export const TeamPUT = Type.Object({
    id: Type.Number(),
    team: Team,
    oldTeam: Team
})

export type TeamPUTType = Static<typeof TeamPUT>