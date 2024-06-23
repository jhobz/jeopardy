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

    nodecg.listenFor('resetBoard', ({ boardName }: { boardName: string }) => {
        boardStatesRep.value[boardName] = new Array(5).fill(
            new Array<number>(6).fill(0)
        )
    })

    nodecg.listenFor(
        'clearQuestion',
        ({ boardName }: { boardName: string }) => {
            clearQuestion(boardName)
        }
    )

    nodecg.listenFor('coverClicked', (data) => {
        advanceBoardState(data.boardName, data.row, data.col)

        gameStateRep.value = {
            answerControls: 1,
            currentClue: { ...data.clue, row: data.row, column: data.col },
            currentRound: gameStateRep.value?.currentRound || 'single',
            boardDisplayMode: 'question',
        }

        nodecg.sendMessage('showQuestion', data)
    })

    nodecg.listenFor(
        'playerAnswer',
        ({
            player: playerId,
            isCorrect,
            boardName,
        }: {
            player: number
            isCorrect: boolean
            boardName: string
        }) => {
            if (!gameStateRep.value.currentClue) {
                logger.error(
                    'Attempted to give player answer without currentClue in state!'
                )
                return
            }

            const player = playersRep.value.find((p) => p.id === playerId)
            if (!player) {
                logger.info(player)
                logger.error(
                    'Invalid player ID when attempting to give answer!',
                    playerId
                )
                return
            }

            if (!player.points) {
                player.points = 0
            }

            player.points +=
                (isCorrect ? 1 : -1) *
                (gameStateRep.value.currentClue?.value || 0)

            if (isCorrect) {
                clearQuestion(boardName)
            }
        }
    )

    const activeBuzzerRep = nodecg.Replicant<number | null>('activeBuzzer', {
        defaultValue: null,
    })

    nodecg.listenFor('buzzerPressed', ({ index }) => {
        console.log('Buzzer pressed: ', index)

        if (activeBuzzerRep.value === null) {
            activeBuzzerRep.value = index
        }
    })

    nodecg.listenFor('buzzerReset', () => {
        console.log('Buzzer reset');
        
        activeBuzzerRep.value = null;
    });

    
    nodecg.listenFor('updatePlayer', (player) => {        
        playersRep.value = playersRep.value.map(x => x.id === player.id ? player : x);
        activeBuzzerRep.value = null
    })

    const clearQuestion = (boardName: string) => {
        if (!gameStateRep.value.currentClue) {
            return
        }

        const row = gameStateRep.value.currentClue.row
        const col = gameStateRep.value.currentClue.column

        advanceBoardState(boardName, row, col)

        gameStateRep.value = {
            answerControls: 0,
            currentClue: undefined,
            boardDisplayMode: 'board',
        }
    }

    const advanceBoardState = (boardName: string, row: number, col: number) => {
        try {
            const boardCopy = deepCopy(boardStatesRep.value[boardName])
            boardCopy[row][col] = boardCopy[row][col] + 1

            boardStatesRep.value = {
                ...boardStatesRep.value,
                [boardName]: boardCopy,
            }
        } catch (e) {
            logger.error('COULD NOT ADVANCE BOARD STATE!!', e)
        }
    }
}

const deepCopy = (arr: Array<Array<number>>) => {
    const clone = new Array(arr.length)

    for (let i = 0; i < arr.length; i++) {
        clone[i] = arr[i].slice()
    }

    return clone
}
