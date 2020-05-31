import { Rating, rate } from 'ts-trueskill'
import _ from 'lodash'

const processPlayerElo2 = ({
    teamOne,
    teamTwo,
}: {
    teamOne: { players: { elo: number; sigma: number | undefined }[]; score: number }
    teamTwo: { players: { elo: number; sigma: number | undefined }[]; score: number }
}) => {
    const teamOneElo = _.sum(teamOne.players.map(p => p.elo))
    const teamTwoElo = _.sum(teamTwo.players.map(p => p.elo))

    let teamOneEloDiff = 0
    let teamTwoEloDiff = 0

    const maxEloDiff = 600

    if (teamOne.score > teamTwo.score) {
        if (teamOneElo > teamTwoElo) {
            teamTwoEloDiff = Math.max(teamOneElo - maxEloDiff, teamTwoElo) - teamTwoElo
        }

        if (teamOneElo < teamTwoElo) {
            teamTwoEloDiff = Math.min(teamOneElo + maxEloDiff, teamTwoElo) - teamTwoElo
        }
    } else {
        if (teamTwoElo > teamOneElo) {
            teamOneEloDiff = Math.max(teamTwoElo - maxEloDiff, teamOneElo) - teamOneElo
        }

        if (teamTwoElo < teamOneElo) {
            teamOneEloDiff = Math.min(teamTwoElo + maxEloDiff, teamOneElo) - teamOneElo
        }
    }

    const teamOneEloAdjust = teamOneEloDiff / teamOne.players.length
    const teamTwoEloAdjust = teamTwoEloDiff / teamTwo.players.length

    // console.log(teamOneEloAdjust, teamTwoEloAdjust)

    const inputRatings = [
        teamOne.players.map(player => ({
            mu: player.elo + teamOneEloAdjust,
            sigma: player.sigma,
        })),
        teamTwo.players.map(player => ({
            mu: player.elo + teamTwoEloAdjust,
            sigma: player.sigma,
        })),
    ]

    console.log(inputRatings)

    const multiplier = 1 + (Math.abs(teamOne.score - teamTwo.score) - 1) / (10 * 2)

    const ratings = rate(
        inputRatings.map(t => t.map(p => new Rating(p.mu, p.sigma))),
        [10 - teamOne.score, 10 - teamTwo.score]
    ).map((t, k) => {
        const minEloGain = (k === 0 ? teamOne.score > teamTwo.score : teamTwo.score > teamOne.score) ? 3 : -3

        return t.map((p, k2) => ({
            mu: Math.round(minEloGain + (p.mu - inputRatings[k][k2].mu) * multiplier),
            sigma: p.sigma,
        }))
    })

    teamOne.players.forEach((player, k) => {
        console.log(ratings[0][k].mu)
    })

    teamTwo.players.forEach((player, k) => {
        console.log(ratings[1][k].mu)
    })

    return ratings
}

const t = {
    teamOne: {
        players: [
            { elo: 1954, sigma: 240 },
            { elo: 1304, sigma: 300 },
            { elo: 1085, sigma: 122 },
            { elo: 1075, sigma: 145 },
        ],
        score: 10,
    },
    teamTwo: {
        players: [
            { elo: 1432, sigma: 300 },
            { elo: 1157, sigma: 300 },
            { elo: 935, sigma: 300 },
            { elo: 856, sigma: 208 },
        ],
        score: 7,
    },
}

processPlayerElo2(t)
