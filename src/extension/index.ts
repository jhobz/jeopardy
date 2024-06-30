import type NodeCG from '@nodecg/types'
import { GameDataParser } from './GameDataParser'
import { JArchiveParser } from './JArchiveParser'
import { GameData, GameState, Player } from '../types/schemas'
import { BoardState, Round } from '../types/board-types'
import { CSVParser } from './CSVParser'

const BOARD_STATE_ROWS = 6
const BOARD_STATE_COLUMNS = 6

let logger: NodeCG.Logger
let gameDataParser: GameDataParser
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
    const gameIdRep = nodecg.Replicant<string>('gameId')

    gameDataFileRep.on('change', async (files) => {
        if ((!files || !files.length) && !hasDoneInitialLoad) {
            hasDoneInitialLoad = true
            return
        }

        if (!files || !files.length) {
            logger.warn('No Game Data File found in assets group.')
            return
        }

        // We're recreating the parser every time the asset file changes,
        // but honestly that's fine.
        if (files[0].ext === '.csv') {
            gameDataParser = new CSVParser()
        } else if (files[0].ext === '.json') {
            if (gameIdRep.value) {
                gameDataParser = new JArchiveParser(gameIdRep.value)
            } else {
                gameDataParser = new JArchiveParser()
            }
        } else {
            // This shouldn't be possible since the asset restricts its file extensions,
            // but better to be safe than sorry.
            throw new Error(
                'Tried to parse unrecognized GameData file extension: ' +
                    files[0].ext
            )
        }

        gameDataRep.value = await gameDataParser.parse(files[0])
    })

    const playersRep = nodecg.Replicant<Player[]>('players', {
        defaultValue: [],
    })

    const gameStateRep = nodecg.Replicant<GameState>('gameState', {
        defaultValue: {
            answerControls: 0,
            currentRound: 'single',
            boardDisplayMode: 'board',
        },
    })

    const boardStatesRep = nodecg.Replicant<Record<string, BoardState>>(
        'boardStates',
        {
            defaultValue: {
                single: new Array(BOARD_STATE_ROWS).fill(
                    new Array<number>(BOARD_STATE_COLUMNS).fill(0)
                ),
                double: new Array(BOARD_STATE_ROWS).fill(
                    new Array<number>(BOARD_STATE_COLUMNS).fill(0)
                ),
                final: new Array(2).fill(new Array<number>(1).fill(0)),
            },
        }
    )

    nodecg.listenFor('nextCategory', () => {
        gameStateRep.value = {
            ...gameStateRep.value,
            displayedCategoryIndex:
                (gameStateRep.value.displayedCategoryIndex ?? 0) + 1,
        }
    })

    nodecg.listenFor('changeMode', (mode: 'intro' | 'board' | 'question') => {
        if (!mode) {
            logger.error("Tried to change to mode that doesn't exist")
            return
        }

        const newValue = {
            ...gameStateRep.value,
            boardDisplayMode: mode,
        }

        if (
            gameStateRep.value.boardDisplayMode !== 'intro' &&
            mode === 'intro'
        ) {
            newValue.displayedCategoryIndex = 0
        }

        gameStateRep.value = newValue
    })

    nodecg.listenFor('resetBoard', () => {
        if (!gameStateRep.value.currentRound) {
            logger.error('No current round set when trying to reset board!')
            return
        }

        boardStatesRep.value[gameStateRep.value.currentRound] = new Array(
            gameStateRep.value.currentRound === 'final' ? 1 : BOARD_STATE_ROWS
        ).fill(
            new Array<number>(
                gameStateRep.value.currentRound === 'final'
                    ? 1
                    : BOARD_STATE_COLUMNS
            ).fill(0)
        )
    })

    nodecg.listenFor('changeRound', (round: Round) => {
        if (!round) {
            logger.error("Tried to change to round that doesn't exist")
            return
        }

        gameStateRep.value = {
            ...gameStateRep.value,
            currentRound: round,
        }
    })

    nodecg.listenFor('clearQuestion', () => {
        clearQuestion()
    })

    nodecg.listenFor('titleCoverClicked', (data) => {
        advanceBoardState(data.boardName, data.row, data.col)
    })

    nodecg.listenFor('coverClicked', (data) => {
        advanceBoardState(data.boardName, data.row, data.col)

        gameStateRep.value = {
            answerControls: 1,
            currentClue: { ...data.clue, row: data.row, column: data.col },
            currentRound: gameStateRep.value?.currentRound,
            boardDisplayMode: 'question',
        }

        nodecg.sendMessage('showQuestion', data)
        nodecg.sendMessage('startIdleTimer')
    })

    nodecg.listenFor('showFinalQuestion', ({ clue, row, col }) => {
        gameStateRep.value = {
            ...gameStateRep.value,
            currentClue: { ...clue, row, column: col },
        }
    })

    nodecg.listenFor(
        'playerAnswer',
        ({
            player: playerId,
            isCorrect,
        }: {
            player: number
            isCorrect: boolean
        }) => {
            if (!gameStateRep.value.currentClue) {
                logger.error(
                    'Attempted to give player answer without currentClue in state!'
                )
                return
            }

            const player = playersRep.value.find((p) => p.id === playerId)
            if (!player) {
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

            nodecg.sendMessage('clearAnswerTimer')

            if (!isCorrect) {
                nodecg.sendMessage('startIdleTimer')
                nodecg.sendMessage('buzzerReset')
            }

            if (isCorrect) {
                clearQuestion()
            }
        }
    )

    const activeBuzzerRep = nodecg.Replicant<number | null>('activeBuzzer', {
        defaultValue: null,
    })

    nodecg.listenFor('buzzerPressed', ({ index }) => {
        if (activeBuzzerRep.value === null) {
            activeBuzzerRep.value = index
        }

        nodecg.sendMessage('clearIdleTimer')
        nodecg.sendMessage('startAnswerTimer')
    })

    nodecg.listenFor('buzzerReset', () => {
        activeBuzzerRep.value = null
        nodecg.sendMessage('startIdleTimer')
    })

    nodecg.listenFor('updatePlayer', (player) => {
        playersRep.value = playersRep.value.map((x) =>
            x.id === player.id ? player : x
        )
    })

    nodecg.listenFor('setGameId', async (gameId) => {
        gameIdRep.value = gameId

        if (gameDataFileRep.value && gameDataFileRep.value.length > 0) {
            gameDataRep.value = await gameDataParser.parse(
                gameDataFileRep.value[0]
            )
        }
    })

    const clearQuestion = () => {
        if (!gameStateRep.value.currentRound) {
            logger.error('No current round set when trying to clear question!')
            return
        }

        if (!gameStateRep.value.currentClue) {
            logger.error('No current clue set when trying to clear question!')
            return
        }

        const row = gameStateRep.value.currentClue.row
        const col = gameStateRep.value.currentClue.column

        advanceBoardState(gameStateRep.value.currentRound, row, col)
        nodecg.sendMessage('clearIdleTimer')
        nodecg.sendMessage('clearAnswerTimer')
        nodecg.sendMessage('buzzerReset')

        gameStateRep.value = {
            ...gameStateRep.value,
            answerControls: 0,
            currentClue: undefined,
            boardDisplayMode: 'board',
        }
    }

    const advanceBoardState = (boardName: string, row: number, col: number) => {
        try {
            const boardCopy = deepCopy(boardStatesRep.value[boardName])
            boardCopy[row][col]++

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
