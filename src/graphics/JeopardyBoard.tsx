import React, { useCallback, useEffect, useState } from 'react'
import { Board } from '../components/Board'
import { useListenFor, useReplicant } from '@nodecg/react-hooks'
import { GameData, GameState } from '../types/schemas'
import { Round } from '../types/board-types'

type JeopardyBoardProps = {
    width?: number
    height?: number
    round?: Round
}

export const JeopardyBoard: React.FC<JeopardyBoardProps> = ({
    width = 1920,
    height = 1080,
    round = 'single',
}) => {
    const [gameDataRep] = useReplicant<GameData>('gameData')
    const [gameStateRep] = useReplicant<GameState>('gameState')
    const [boardData, setBoardData] = useState<GameData>({
        categories: [],
        clues: [],
    })
    const [currentRound, setCurrentRound] = useState<Round>(round)

    useEffect(() => {
        if (!gameDataRep) {
            return
        }

        const categories = gameDataRep?.categories.filter(
            (c) => c.round === currentRound
        )
        const clues = gameDataRep?.clues.filter((c) => c.round === currentRound)

        setBoardData({
            categories,
            clues,
        })
    }, [gameDataRep, currentRound])

    useEffect(() => {
        setCurrentRound(round)
    }, [round])

    useEffect(() => {
        if (!gameStateRep?.currentRound) {
            return
        }

        setCurrentRound(gameStateRep.currentRound)
    }, [gameStateRep])

    // --- Sounds ---
    useListenFor('timeoutSound', () => {
        nodecg.playSound('timeout')
    })

    useListenFor('roundOverSound', () => {
        nodecg.playSound('round-over')
    })

    return (
        <Board
            data={boardData}
            round={currentRound}
            width={width}
            height={height}
        ></Board>
    )
}
