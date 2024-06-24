import React, { useCallback, useEffect, useState } from 'react'
import { Board } from '../components/Board'
import { useReplicant } from '@nodecg/react-hooks'
import { GameData } from '../types/schemas'

type JeopardyBoardProps = {
    width?: number
    height?: number
    round?: 'single' | 'double' | 'final'
}

export const JeopardyBoard: React.FC<JeopardyBoardProps> = ({
    width = 1920,
    height = 1080,
    round = 'single',
}) => {
    const [gameDataRep] = useReplicant<GameData>('gameData')
    const [boardData, setBoardData] = useState<GameData>({
        categories: [],
        clues: [],
    })

    useEffect(() => {
        if (!gameDataRep) {
            return
        }

        const categories = gameDataRep?.categories.filter(
            (c) => c.round === round
        )
        const clues = gameDataRep?.clues.filter((c) => c.round === round)

        setBoardData({
            categories,
            clues,
        })
    }, [gameDataRep, round])

    return (
        <Board
            data={boardData}
            round={round}
            width={width}
            height={height}
        ></Board>
    )
}
