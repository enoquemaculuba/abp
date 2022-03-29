import {query} from "./database";
import mysql from "mysql";
import {TeamType} from "../@types/league/TeamTypes";
import {League} from "../@types/league/GameTypes";
import {getPairs, shuffle} from "../utils/misc";
import {LeaguePUTType} from "../@types/league/LeagueTypes";

import {
    addGame,
    addGameToLeague,
    editPlayoffGame,
    getDataForAddGame,
    getDataForAddGameByPass,
    getGamesById,
    getLatestLeagueTeamsData,
    getLatestPlayersData,
    getLatestPlayoffsData,
    getPlayersTableData,
    getPlayerStats,
    getPlayoffsData
} from './gameDB'

export {addGame, addGameToLeague, getDataForAddGame, getDataForAddGameByPass, editPlayoffGame, getPlayoffsData, getLatestPlayoffsData, getLatestPlayersData, getPlayersTableData, getLatestLeagueTeamsData, getPlayerStats, getGamesById}

/**
 * Add league to database
 *
 * @param leagueName - name of the league
 */
export async function addLeague(leagueName: string) {
    const password = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)
    return await query("INSERT INTO league (name, password) VALUES ?", [[leagueName, password]])
}

/**
 * Add teams to the league
 *
 * @param leagueID
 * @param teams
 */
export async function addLeagueTeams(leagueID: number, teams: Array<TeamType>) {
    const q = `INSERT INTO player (leagueid, teamname, name)
               VALUES ?
               ON DUPLICATE KEY UPDATE leagueid=leagueid
    `;
    const arr: Array<any> = []
    for (let team of teams) {
        arr.push([leagueID, team.teamName, team.player1name])
        arr.push([leagueID, team.teamName, team.player2name])
    }
    return await query(q, arr);
}

/**
 * Edit league
 *
 * @param league
 */
export async function editLeague(league: LeaguePUTType) {
    if (!await deletePlayoffsById(league.id)) {
        return {success: false, rows: []}
    }
    if (league.inPlayoffs && league.playoffsTeamsAmount) {
        const teams = (await getTopNTeams(league.playoffsTeamsAmount, league.id)).rows.map(x => x.teamName)
        const response = await setUpPlayoffs(teams, league.id)
        if (!response.success) {
            return response
        }
    }
    const q = `
        UPDATE league
        SET leagueID=leagueID,
            name = IFNULL(${mysql.escape(league.name) || null}, name),
            playoffs = IFNULL(${mysql.escape(league.inPlayoffs) || null}, playoffs),
            playoffTeams = IFNULL(${mysql.escape(league.playoffsTeamsAmount) || null}, playoffTeams)
        WHERE leagueID = ${mysql.escape(league.id)}
    `;
    let response = await query(q)
    if (!response.success) {
        return response
    }
    return await getPlayoffsData(league.id)
}

/**
 * Delete league by id
 *
 * @param leagueID
 */
export async function deleteLeagueById(leagueID: number) {
    return await query(`
        DELETE
        FROM league
        WHERE leagueID = ${mysql.escape(leagueID)};
        DELETE
        FROM playerstat
        WHERE leagueID = ${mysql.escape(leagueID)};
        DELETE
        FROM player
        WHERE leagueID = ${mysql.escape(leagueID)};
        DELETE
        FROM game
        WHERE leagueID = ${mysql.escape(leagueID)};
        DELETE
        FROM playoffs
        WHERE ID = ${mysql.escape(leagueID)};`)
}

/**
 * Delete playoffs by id
 *
 * @param id
 */
async function deletePlayoffsById(id: number) {
    const q = `
        DELETE
        FROM playoffs
        WHERE id = ${mysql.escape(id)}
    `
    return await query(q)
}


/**
 * Get the latest league id
 * @return last max id if found, 0 otherwise
 */
export async function getLastID(): Promise<number> {
    const q = await query(`SELECT MAX(leagueID) as leagueID
                           FROM league`)
    return q.rows[0].leagueID ?? 0
}

/**
 * Get the league by id
 *
 * @param leagueID
 */
export async function getLeagueById(leagueID: number) {
    return query(`SELECT *,
                         (SELECT COUNT(distinct teamName) FROM player WHERE leagueID = ${mysql.escape(leagueID)}) as teamsAmount
                  FROM league
                  WHERE leagueID = ${mysql.escape(leagueID)}
                  ORDER BY dateTime`)
}

/**
 * Get league by unique id
 *
 * @param pass
 */
export async function getLeagueByPass(pass: string) {
    return query(`SELECT *
                  FROM league
                  WHERE password = ${mysql.escape(pass)}
                  `)
}

/**
 * Get all leagues in database
 *
 */
export async function getLeagues() {
    return query(`SELECT *
                  FROM league
                  ORDER BY dateTime`)
}

/**
 * Get the latest league
 *
 */
export async function getLatestLeague() {
    return query(`SELECT *
                  FROM league
                  WHERE leagueID = (SELECT MAX(leagueID) from league)`)
}

/**
 * Get id of the newest league
 *
 */
export async function getLatestLeagueID(): Promise<number> {
    const res = await query('SELECT MAX(leagueID) as max from league');
    return res.rows[0]?.max ?? NaN;
}

/**
 * Get data of league by id
 *
 * @param id
 */
export async function getNLeagueData(id: number): Promise<League> {
    const q = `
        SELECT name,
               playoffs,
               playoffTeams,
               (SELECT COUNT(distinct teamName) FROM player WHERE leagueID = ${mysql.escape(id)}) as teamsAmount
        FROM league
        WHERE leagueID = ${mysql.escape(id)}
    `
    const lData = (await query(q)).rows
    return {
        name: lData[0]?.name ?? '',
        playoffs: Boolean(lData[0]?.playoffs ?? false),
        playoffTeams: lData[0]?.playoffTeams ?? 0,
        teamsAmount: lData[0]?.teamsAmount ?? 0
    }
}

/**
 * Get top n teams
 *
 * @param n
 * @param leagueID
 */
async function getTopNTeams(n: number, leagueID: number) {
    const q = `
        SELECT p2.teamName
        FROM (SELECT p1.teamName, IFNULL(wins / (wins + losses) * 100, 0) as winPercentage
              FROM (SELECT p.teamName,
                           COUNT(case when winningTeam = p.teamName then 1 end)                 as wins,
                           COUNT(case when losingTeam = p.teamName then 1 end)                  as losses,
                           IFNULL(SUM(case when winningTeam = p.teamName then leftCups end), 0) as leftCups
                    FROM (SELECT distinct teamName, leagueID FROM player p) as p
                             LEFT JOIN game g on p.leagueID = g.leagueID and
                                                 (p.teamName = g.winningTeam or p.teamName = g.losingTeam)
                    WHERE p.leagueID = ${mysql.escape(leagueID)}
                    GROUP BY p.teamName) as p1
              ORDER BY wins DESC, leftCups DESC, winPercentage DESC) as p2
        LIMIT ${mysql.escape(n)}
    `
    return await query(q)
}

/**
 * Get team from league
 *
 * @param leagueID
 * @param name
 */
export async function getTeam(leagueID: number, name: string) {
    return await query(`
        SELECT name
        FROM player
        WHERE leagueID = ${mysql.escape(leagueID)}
          AND teamName = ${mysql.escape(name)}
    `)
}

/**
 * Get all the teams in league
 *
 * @param leagueID
 */
export async function getTeams(leagueID: number) {
    return await query(`
        SELECT DISTINCT teamName
        FROM player
        WHERE leagueID = ${mysql.escape(leagueID)}
    `)
}

/**
 * Get the teams of the newest league
 *
 */
export async function getLatestLeagueTeams() {
    const q1 = `
        SELECT distinct teamName
        FROM player
        WHERE leagueID = (SELECT MAX(leagueID) from league)
    `;
    const q2 = `
        SELECT winningTeam, losingTeam
        FROM game
        WHERE leagueID = (SELECT MAX(leagueID) from league)
    `
    const teams = await query(q1);
    const games = await query(q2);
    return {teams: teams.rows, games: games.rows}
}

/**
 *
 * Edit player in league
 *
 * @param name
 * @param oldName
 * @param id
 */
async function editPlayer(name: string, oldName: string, id: number) {
    const q1 = await query(`
        UPDATE playerStat
        SET name=${mysql.escape(name)}
        where name = ${mysql.escape(oldName)}
          AND leagueID = ${mysql.escape(id)}
    `)
    const q2 = await query(`
        UPDATE player
        SET name=${mysql.escape(name)}
        where name = ${mysql.escape(oldName)}
          AND leagueID = ${mysql.escape(id)}
    `)
    return q1.success && q2.success
}

interface team {
    teamName: string,
    player1name: string,
    player2name: string,
    player1cups?: number,
    player2cups?: number
}

/**
 * Edit team in league
 *
 * @param team
 * @param oldTeam
 * @param leagueID
 */
export async function editTeam(team: team, oldTeam: team, leagueID: number) {
    let response = false;
    if (team == oldTeam) {
        return true
    }
    if (team.teamName != oldTeam.teamName) {
        response = (await query(`
                    UPDATE player
                    SET teamName=${mysql.escape(team.teamName)}
                    WHERE teamName = ${mysql.escape(oldTeam.teamName)}
                      AND leagueID = ${mysql.escape(leagueID)}
            `)).success &&
            (await query(`
                UPDATE game
                SET winningTeam=${mysql.escape(team.teamName)}
                WHERE winningTeam = ${mysql.escape(oldTeam.teamName)}
                  AND leagueID = ${mysql.escape(leagueID)}
            `)).success && (await query(`
                    UPDATE game
                    SET losingTeam=${mysql.escape(team.teamName)}
                    WHERE losingTeam = ${mysql.escape(oldTeam.teamName)}
                      AND leagueID = ${mysql.escape(leagueID)}
            `)).success

            && (await query(`
                    UPDATE playerstat
                    SET oppositeTeam=${mysql.escape(team.teamName)}
                    WHERE oppositeTeam = ${mysql.escape(oldTeam.teamName)}
                      AND leagueID = ${mysql.escape(leagueID)}
            `)).success

            && (await query(`
                    UPDATE playoffs
                    SET team1=${mysql.escape(team.teamName)}
                    WHERE team1 = ${mysql.escape(oldTeam.teamName)}
                      AND ID = ${mysql.escape(leagueID)}
            `)).success

            && (await query(`
                    UPDATE playoffs
                    SET team2=${mysql.escape(team.teamName)}
                    WHERE team2 = ${mysql.escape(oldTeam.teamName)}
                      AND ID = ${mysql.escape(leagueID)}
            `)).success
        if (!response) {
            return false
        }
    }
    if (team.player1name != oldTeam.player1name) {
        response = await editPlayer(team.player1name, oldTeam.player1name, leagueID)
        if (!response) {
            return false
        }
    }
    if (team.player2name != oldTeam.player2name) {
        response = await editPlayer(team.player2name, oldTeam.player2name, leagueID)
        if (!response) {
            return false
        }
    }
    return response
}

/**
 * Delete team from league
 *
 * @param name
 * @param id
 */
export async function deleteTeam(name: string, id: number) {
    return (await query(`
        DELETE
        FROM player
        WHERE leagueID = ${mysql.escape(id)}
          AND teamName = ${mysql.escape(name)}
    `)).success
}


/**
 * Set up playoffs for the league
 *
 * @param teams
 * @param id
 */
async function setUpPlayoffs(teams: Array<string>, id: number) {
    const pairs = getPairs(shuffle(teams)).map((x, index) => [id, 1, index + 1, ...x])
    const q: string = `INSERT INTO playoffs (ID, round, slot, team1, team2)
                       VALUES ?
                       ON DUPLICATE KEY UPDATE ID = ID
    `
    return await query(q, pairs)
}
