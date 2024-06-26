import dns from 'node:dns'
import NodeCG from '@nodecg/types'
import csv from 'csvtojson'
import { GameData } from '../types/schemas'
import { GameDataParser, getCategoriesFromClues } from './GameDataParser'
import { Round } from '../types/board-types'

// Everything is a string because it's imported from a CSV file
type CSVClue = {
    index: string
    category: string
    value: string
    question: string
    answer: string
    round: Round
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

        const categories = getCategoriesFromClues(game)

        return {
            categories: categories,
            clues: game,
        } as GameData
    }
}
