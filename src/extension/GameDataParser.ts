import NodeCG from '@nodecg/types'
import type { GameData } from '../types/schemas'

export interface GameDataParser {
    parse: (assetFile: NodeCG.AssetFile) => Promise<GameData>
}

export const getCategoriesFromClues = (game: GameData['clues']) => {
    const categoryNames = [...new Set(game.map((clue) => clue.category))]
    let singleRoundIndex = 0
    let doubleRoundIndex = 0

    return categoryNames.map((category) => {
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
}
