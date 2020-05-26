import { Rating, rate } from 'ts-trueskill'
import _ from 'lodash'

const processPlayerElo = () => {
    const players: { mu: number; sigma: number | undefined }[] = [
        { mu: 1200, sigma: 20 },
        { mu: 1200, sigma: 20 },
        { mu: 1200, sigma: 20 },
        { mu: 1200, sigma: 20 },
    ]

    const games = [{ s1: 0, s2: 0 }]

    _.range(1).map(g => {
        const t1 = players.slice(0, 2)
        const t2 = players.slice(2)

        const scoreOne = 5
        const scoreTwo = 10

        const teamRate = rate(
            [t1.map(p => new Rating(p.mu, p.sigma)), t2.map(p => new Rating(p.mu, p.sigma))]
            // [10 - scoreOne, 10 - scoreTwo]
        )

        const multiplier = 1 + Math.abs(scoreOne - scoreTwo) / 20

        const a = ((scoreOne > scoreTwo ? 3 : -3) + teamRate[0][0].mu - t1[0].mu) * multiplier
        const b = ((scoreOne > scoreTwo ? 3 : -3) + teamRate[0][1].mu - t1[1].mu) * multiplier
        const c = ((scoreTwo > scoreOne ? 3 : -3) + teamRate[1][0].mu - t2[0].mu) * multiplier
        const d = ((scoreTwo > scoreOne ? 3 : -3) + teamRate[1][1].mu - t2[1].mu) * multiplier

        t1[0].mu += a
        t1[0].sigma = teamRate[0][0].sigma

        t1[1].mu += b
        t1[1].sigma = teamRate[0][1].sigma

        t2[0].mu += c
        t2[0].sigma = teamRate[1][0].sigma

        t2[1].mu += d
        t2[1].sigma = teamRate[1][1].sigma

        console.log(teamRate[0][0].mu, teamRate[1][0].mu)

        // console.log(
        //     `${scoreOne} - ${scoreTwo} => ${teamRate[0][0].mu + teamRate[0][1].mu} - ${
        //         teamRate[1][0].mu + teamRate[1][1].mu
        //     } => ${a + b} - ${c + d}`
        // )
    })

    // console.log(players)
}

// processPlayerElo()

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

    // teamOne.players.forEach((player, k) => {
    //     console.log(ratings[0][k].mu)
    // })

    // teamTwo.players.forEach((player, k) => {
    //     console.log(ratings[1][k].mu)
    // })

    return ratings
}

processPlayerElo2({
    teamOne: {
        players: [
            { elo: 3600, sigma: undefined },
            { elo: 3500, sigma: undefined },
            { elo: 3200, sigma: undefined },
            { elo: 3800, sigma: undefined },
        ],
        score: 10,
    },
    teamTwo: {
        players: [
            { elo: 1600, sigma: undefined },
            { elo: 2100, sigma: undefined },
            { elo: 3100, sigma: undefined },
            { elo: 2800, sigma: undefined },
        ],
        score: 1,
    },
})
