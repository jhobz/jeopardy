import dns from 'node:dns'
import NodeCG from '@nodecg/types'
import { GameData } from '../types/schemas'
import { GameDataParser } from './GameDataParser'

type JArchiveClue = {
    category: string
    value: string
    question: string
    answer: string
    round: 'Jeopardy!' | 'Double Jeopardy!' | 'Final Jeopardy!' | 'Tiebreaker'
    show_number: string
    air_date: string
}

export class JArchiveParser implements GameDataParser {
    private BASE_URI = 'http://localhost:9090'
    private GAME_ID = '5345'

    constructor() {
        // Node resolves DNS with IPv6 first, so it will try to convert localhost to ::1. This is an alternative to replacing localhost with 127.0.0.1
        dns.setDefaultResultOrder('ipv4first')
    }

    async parse(assetFile: NodeCG.AssetFile) {
        const data = (await (
            await fetch(this.BASE_URI + assetFile.url)
        ).json()) as Array<JArchiveClue>

        const singleGame = data
            .filter((clue) => {
                return clue.show_number === this.GAME_ID
            })
            .map((clue) => {
                // Transform round
                let round
                switch (clue.round) {
                    case 'Jeopardy!':
                        round = 'single'
                        break
                    case 'Double Jeopardy!':
                        round = 'double'
                        break
                    case 'Final Jeopardy!':
                        round = 'final'
                        break
                    case 'Tiebreaker':
                        round = 'final'
                        break
                }

                // Transform value
                let value
                if (
                    !clue.value ||
                    clue.value === 'None' ||
                    clue.value.charAt(0) !== '$'
                ) {
                    value = 0
                } else {
                    value = Number(clue.value.replaceAll(',', '').slice(1))
                }

                return {
                    question: clue.question,
                    answer: clue.answer,
                    value,
                    category: clue.category,
                    round,
                }
            })

        const categoryNames = [
            ...new Set(singleGame.map((clue) => clue.category)),
        ]

        let singleRoundIndex = 0
        let doubleRoundIndex = 0
        const categories = categoryNames.map((category) => {
            let index = 0
            const round = singleGame.find(
                (clue) => clue.category === category
            )?.round
            if (round === 'single') {
                index = singleRoundIndex++
            } else if (round === 'double') {
                index = doubleRoundIndex++
            }

            return {
                name: category,
                round,
                index: index,
            }
        })

        return {
            categories: categories,
            clues: singleGame,
        } as GameData
    }
}
