import {Static, Type} from "@sinclair/typebox";

export const Team = Type.Object({
        teamName: Type.String(),
        player1name: Type.String(),
        player2name: Type.String(),
    }
)
export type TeamType = Static<typeof Team>

export const TeamScore = Type.Object({
    teamName: Type.String(),
    player1name: Type.String(),
    player2name: Type.String(),
    player1score: Type.Number(),
    player2score: Type.Number(),
})