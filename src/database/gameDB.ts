import {GameType, LeagueGame, LeagueGames, Match} from "../@types/league/GameTypes";
import {query} from "./database";
import mysql from "mysql";
import {getLeagueByPass, getNLeagueData} from "./leagueDB";

/**
 * Add game to te league
 * TODO optimize and maybe create a class component to get rid of boilerplate
 *
 * @param game
 */
export async function addGame(game: GameType) {
    const leagueID = game.leagueID
    const gameQuery: string = `INSERT INTO game (leagueID, winningTeam, losingTeam, leftCups)
                               VALUES ?
                               ON DUPLICATE KEY UPDATE leagueID=leagueID
    `;
    //player query do not change the order
    const playerStatQuery: string = `INSERT INTO playerStat (cups, leagueID, oppositeteam, name, team)
                                     VALUES ?
                                     ON DUPLICATE KEY UPDATE leagueID=leagueID
    `;
    const leftCups = 10 - game.loser.player1score - game.loser.player2score
    const firstQuery = await query(gameQuery, [[leagueID, game.winner.teamName, game.loser.teamName, leftCups]])
    if (!firstQuery.success) {
        return firstQuery
    }
    const arr: Array<any> = []
    arr.push([game.winner.player1score, leagueID, game.loser.teamName, game.winner.player1name, game.winner.teamName])
    arr.push([game.winner.player2score, leagueID, game.loser.teamName, game.winner.player2name,game.winner.teamName])
    arr.push([game.loser.player1score, leagueID, game.winner.teamName, game.loser.player1name,game.loser.teamName])
    arr.push([game.loser.player2score, leagueID, game.winner.teamName, game.loser.player2name,game.loser.teamName])
    return await query(playerStatQuery, arr)
}

/**
 * Add playoff game to the league
 *
 * @param match
 * @param leagueID
 */
async function addPlayoffGame(match: Match, leagueID: number) {
    return await query(`INSERT INTO playoffs (ID, team1, team2, team1score, team2score, round, slot)
                        VALUES ?
                        ON DUPLICATE KEY UPDATE team1      = IF(VALUES(team1) != 'TBA', VALUES(team1), team1),
                                                team2      = IF(VALUES(team2) != 'TBA', VALUES(team2), team2),
                                                team1score = VALUES(team1score),
                                                team2score = VALUES(team2score)`, [[leagueID, match.team1, match.team2, match.team1score, match.team2score, match.round, match.slot]])
}

/**
 * Edit playoff game
 *
 * @param match
 * @param leagueID
 */
export async function editPlayoffGame(match: Match, leagueID: number) {
    const winner = match.team1score > match.team2score ? match.team1 : match.team2;
    const loser = match.team1score > match.team2score ? match.team2 : match.team1;

    return await query(`
        UPDATE playoffs
        SET team1      = ${mysql.escape(match.team1)},
            team2      = ${mysql.escape(match.team2)},
            team1score = ${mysql.escape(match.team1score)},
            team2score = ${mysql.escape(match.team2score)}
        WHERE ID = ${mysql.escape(leagueID)}
          AND round = ${mysql.escape(match.round)}
          AND slot = ${mysql.escape(match.slot)};
        UPDATE playoffs
        SET team1 = IF(team1 = ${mysql.escape(loser)}, ${mysql.escape(winner)}, team1),
            team2 = IF(team2 = ${mysql.escape(loser)}, ${mysql.escape(winner)}, team2)
        WHERE ID = ${mysql.escape(leagueID)}
          AND round > ${mysql.escape(match.round)}
    `)
}

/**
 * Add either playoff or normal game to the league
 *
 * @param game
 */
export async function addGameToLeague(game: LeagueGame) {
    if (game.isInPlayoffs) {
        const match = game.match
        let response = await addPlayoffGame(match, game.leagueID)
        if (!response.success) {
            return response
        }
        const next: Match = {
            team1: match.slot % 2 == 1 ? game.winner.teamName : 'TBA',
            team2: match.slot % 2 == 0 ? game.winner.teamName : 'TBA',
            team1score: 0,
            team2score: 0,
            round: match.round + 1,
            slot: Math.ceil(match.slot / 2)
        }
        return await addPlayoffGame(next, game.leagueID)
    } else {
        await query(`DELETE FROM game WHERE leagueID=${mysql.escape(game.leagueID)} AND winningTeam=${mysql.escape(game.loser.teamName)} AND losingTeam=${mysql.escape(game.winner.teamName)}`)
        await query(`DELETE FROM playerstat WHERE leagueID=${mysql.escape(game.leagueID)} AND ((team=${mysql.escape(game.winner.teamName)} AND oppositeTeam=${mysql.escape(game.loser.teamName)}) OR (team=${mysql.escape(game.loser.teamName)} AND oppositeTeam=${mysql.escape(game.winner.teamName)}))`)
        const gameQuery: string = `INSERT INTO game (leagueID, winningTeam, losingTeam, leftCups)
                                   VALUES ?
                                   ON DUPLICATE KEY UPDATE leagueID=leagueID
        `;
        //player query do not change the order
        const playerStatQuery: string = `INSERT INTO playerStat (cups, leagueID, oppositeteam, name, team)
                                         VALUES ?
                                         ON DUPLICATE KEY UPDATE leagueID=leagueID
        `;
        const leftCups = 10 - game.loser.player1score - game.loser.player2score
        const firstQuery = await query(gameQuery, [[game.leagueID, game.winner.teamName, game.loser.teamName, leftCups]])
        if (!firstQuery.success) {
            return firstQuery
        }
        const arr: Array<any> = []
        arr.push([game.winner.player1score, game.leagueID, game.loser.teamName, game.winner.player1name, game.winner.teamName])
        arr.push([game.winner.player2score, game.leagueID, game.loser.teamName, game.winner.player2name, game.winner.teamName])
        arr.push([game.loser.player1score, game.leagueID, game.winner.teamName, game.loser.player1name, game.loser.teamName])
        arr.push([game.loser.player2score, game.leagueID, game.winner.teamName, game.loser.player2name, game.loser.teamName])
        return await query(playerStatQuery, arr)
    }
}

/**
 * Get games in league
 *
 * @param id
 */
export async function getGamesById(id: number) {
    return query(`SELECT *
                  FROM game
                  WHERE leagueID = ${mysql.escape(id)}`)
}

/**
 * Get data of playoffs
 *
 * @param id
 */
export async function getPlayoffsData(id: number) {
    const q = `
        SELECT team1, team2, team1score, team2score, round, slot
        FROM playoffs
        WHERE ID = ${mysql.escape(id)}
    `
    return await query(q)
}

/**
 * Get player stats
 *
 * @param id
 */
export async function getPlayerStats(id: number) {
    const q = `
        SELECT *
        FROM playerstat
        WHERE leagueID = ${mysql.escape(id)}
    `
    return await query(q)
}

/**
 * Get data for add game page
 *
 * @param id
 */
export async function getDataForAddGame(id: number): Promise<LeagueGames> {
    const teams = await query(`SELECT p1.teamName as teamName, p1.name as player1name, p2.name as player2name
                               FROM player p1
                                        LEFT JOIN player p2 ON p1.teamName = p2.teamName AND NOT (p1.name = p2.name)
                               WHERE p1.leagueID = ${mysql.escape(id)}
                                 AND p2.leagueID = ${mysql.escape(id)}
                               GROUP BY p1.teamName`);
    return {
        playoffs: (await getPlayoffsData(id)).rows,
        teams: teams.rows,
        league: await getNLeagueData(id)
    }
}

/**
 * Get data for add game page but by unique id
 *
 * @param pass
 */
export async function getDataForAddGameByPass(pass: string): Promise<LeagueGames> {
    const league = await getLeagueByPass(pass)
    if(!league.success||league.rows.length==0) {
        return {
            playoffs: [],
            teams: [],
            league: {name:'', playoffs: false, playoffTeams: 0, teamsAmount: 0}
        }
    }
    const id = league.rows[0].leagueID;
    const teams = await query(`SELECT p1.teamName as teamName, p1.name as player1name, p2.name as player2name
                               FROM player p1
                                        LEFT JOIN player p2 ON p1.teamName = p2.teamName AND NOT (p1.name = p2.name)
                               WHERE p1.leagueID = ${mysql.escape(id)}
                                 AND p2.leagueID = ${mysql.escape(id)}
                               GROUP BY p1.teamName`);
    return {
        playoffs: (await getPlayoffsData(id)).rows,
        teams: teams.rows,
        league: {...await getNLeagueData(id), id: id},
        games: (await getGamesById(id)).rows
    }
}

/**
 * Get data for players table
 *
 * @param id
 */
export async function getPlayersTableData(id: number) {
    return await query(`SELECT DISTINCT p.name, IFNULL(SUM(cups), 0) as cups, COUNT(oppositeTeam) as games, teamName
                        FROM playerstat s
                                 RIGHT JOIN player p ON p.leagueID = s.leagueID and p.name = s.name
                        WHERE p.leagueID = ${mysql.escape(id)}
                        GROUP BY name`)
}

/**
 * Get data of the newest playoffs
 *
 */
export async function getLatestPlayoffsData() {
    const limit = (await query(`
        SELECT playoffTeams
        FROM league
        WHERE leagueID = (SELECT MAX(leagueID) from league)
    `)).rows
    if (limit[0]?.playoffTeams == undefined) {
        return {success: false, error: {message: 'Could not get limit of playoffs'}}
    }
    const q2 = `
        SELECT p2.teamName
        FROM (SELECT p1.teamName, IFNULL(wins / (wins + losses) * 100, 0) as winPercentage
              FROM (SELECT p.teamName,
                           COUNT(case when winningTeam = p.teamName then 1 end)                 as wins,
                           COUNT(case when losingTeam = p.teamName then 1 end)                  as losses,
                           IFNULL(SUM(case when winningTeam = p.teamName then leftCups end), 0) as leftCups
                    FROM (SELECT distinct teamName, leagueID FROM player p) as p
                             LEFT JOIN game g on p.leagueID = g.leagueID and
                                                 (p.teamName = g.winningTeam or p.teamName = g.losingTeam)
                    WHERE p.leagueID = (SELECT MAX(leagueID) from league)
                    GROUP BY p.teamName) as p1
              ORDER BY wins DESC, leftCups DESC, winPercentage DESC) as p2
        LIMIT ${limit[0]?.playoffTeams}
    `
    return await query(q2)
}

/**
 * Get the newest data of the players
 */
export async function getLatestPlayersData() {
    const q = `
        SELECT p.name, p.teamName, IFNULL(SUM(p2.cups), 0) as cups, COUNT(p2.oppositeTeam) as games
        FROM player p
                 LEFT JOIN playerstat p2 on p.leagueID = p2.leagueID AND p.name = p2.name
        WHERE p.leagueID = (SELECT MAX(leagueID) from league)
        GROUP BY p.name;
    `;
    return await query(q);
}

/**
 * Get the newest data of the teams
 */
export async function getLatestLeagueTeamsData() {
    const q = `
        SELECT distinct p.teamName,
                        (SELECT COUNT(winningTeam)
                         FROM game g
                         WHERE p.leagueID = g.leagueID and p.teamName = g.winningTeam) as wins,
                        (SELECT COUNT(losingTeam)
                         FROM game g
                         WHERE p.leagueID = g.leagueID and p.teamName = g.losingTeam)  as losses,
                        (SELECT IFNULL(SUM(leftCups), 0)
                         FROM game g
                         WHERE p.leagueID = g.leagueID and p.teamName = g.winningTeam) as leftCups
        FROM player p
        WHERE leagueID = (SELECT MAX(leagueID) from league)
    `
    return await query(q);
}
