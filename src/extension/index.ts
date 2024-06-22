import type NodeCG from '@nodecg/types'
import { GameDataParser } from './GameDataParser'
import { JArchiveParser } from './JArchiveParser'
import { GameData, GameState, Player } from '../types/schemas'
import { BoardState } from '../types/board-types'

let logger: NodeCG.Logger
let hasDoneInitialLoad = false

module.exports = function (nodecg: NodeCG.ServerAPI) {
    logger = nodecg.log

    const gameDataRep = nodecg.Replicant<GameData>('gameData', {
        defaultValue: {
            categories: [],
            clues: [],
        },
    })
    const gameDataFileRep =
        nodecg.Replicant<NodeCG.AssetFile[]>('assets:game-data')
    let gameDataParser: GameDataParser

    gameDataFileRep.on('change', async (fileRep) => {
        if ((!fileRep || !fileRep.length) && !hasDoneInitialLoad) {
            hasDoneInitialLoad = true
            return
        }

        if (!fileRep || !fileRep.length) {
            logger.warn('No Game Data File found in assets group.')
            return
        }

        // TODO: Check for file type
        gameDataParser = new JArchiveParser()

        gameDataRep.value = await gameDataParser.parse(fileRep[0])
    })

    const playersRep = nodecg.Replicant<Player[]>('players', {
        defaultValue: [],
    })

    const gameStateRep = nodecg.Replicant<GameState>('gameState', {
        defaultValue: {},
    })

    const boardStatesRep = nodecg.Replicant<Record<string, BoardState>>(
        'boardStates',
        {
            defaultValue: {
                singleJeopardyBoardState: new Array(5).fill(
                    new Array<number>(6).fill(0)
                ),
            },
        }
    )

    nodecg.listenFor('coverClicked', (data) => {
        const boardCopy = deepCopy(boardStatesRep.value[data.boardName])
        boardCopy[data.row][data.col] = boardCopy[data.row][data.col] + 1

        boardStatesRep.value = {
            ...boardStatesRep.value,
            [data.boardName]: boardCopy,
        }

        nodecg.sendMessage('showQuestion', data)
    })
}

const deepCopy = (arr: Array<Array<number>>) => {
    const clone = new Array(arr.length)

    for (let i = 0; i < arr.length; i++) {
        clone[i] = arr[i].slice()
    }

    return clone
}
