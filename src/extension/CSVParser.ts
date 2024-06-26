import dns from 'node:dns'
import NodeCG from '@nodecg/types'
import csv from 'csvtojson'
import { GameData } from '../types/schemas'
import { GameDataParser } from './GameDataParser'

// Everything is a string because it's imported from a CSV file
type CSVClue = {
    index: string
    category: string
    value: string
    question: string
    answer: string
    round: 'single' | 'double' | 'final'
    details: string
    row_index: string
    col_index: string
}

export class CSVParser implements GameDataParser {
    private BASE_URI = 'http://localhost:9090'

    constructor() {
        // Node resolves DNS with IPv6 first, so it will try to convert localhost to ::1. This is an alternative to replacing localhost with 127.0.0.1
        dns.setDefaultResultOrder('ipv4first')
    }

    async parse(assetFile: NodeCG.AssetFile) {
        const game =
            // csvtojson's fromFile function expects a local file and doesn't appear to work properly with a remote file, so we'll fetch ourselves
            (
                (await csv().fromString(
                    await (await fetch(this.BASE_URI + assetFile.url)).text()
                )) as Array<CSVClue>
            ).map(
                ({
                    category,
                    value,
                    question,
                    answer,
                    round,
                    details,
                    row_index,
                    col_index,
                }) => {
                    return {
                        category,
                        value: parseInt(value),
                        question,
                        answer,
                        round,
                        details,
                        row: parseInt(row_index),
                        column: parseInt(col_index),
                    } as GameData['clues'][0]
                }
            )

        const categoryNames = [...new Set(game.map((clue) => clue.category))]

        let singleRoundIndex = 0
        let doubleRoundIndex = 0
        const categories = categoryNames.map((category) => {
            let index = 0
            const round = game.find((clue) => clue.category === category)?.round
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
            clues: game,
        } as GameData
    }
}
