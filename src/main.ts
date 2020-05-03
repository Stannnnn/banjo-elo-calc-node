import { Rating, rate_1vs1 } from 'ts-trueskill'

const processPlayerElo = () => {
    const sumEloOneBefore = 200
    const sumEloTwoBefore = 300

    const scoreOne = 10
    const scoreTwo = 6

    const skill = rate_1vs1(
        new Rating(sumEloOneBefore, Math.pow((scoreOne - scoreTwo) * 18595, 0.39794)),
        new Rating(sumEloTwoBefore, Math.pow((scoreOne - scoreTwo) * 18595, 0.39794))
    )

    const team1n = (skill[0].mu - sumEloOneBefore) / 4
    const team2n = (skill[1].mu - sumEloTwoBefore) / 4

    console.log(team1n, team2n)
}

processPlayerElo()
