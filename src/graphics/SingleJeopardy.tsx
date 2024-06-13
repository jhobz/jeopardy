import React, { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Board } from '../components/Board'
import { useReplicant } from '@nodecg/react-hooks'
import { GameData } from '../types/schemas'

type SingleJeopardyProps = {
    width?: number
    height?: number
}

export const SingleJeopardy: React.FC<SingleJeopardyProps> = ({
    width = 1920,
    height = 1080,
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
            (c) => c.round === 'single'
        )
        const clues = gameDataRep?.clues.filter((c) => c.round === 'single')

        setBoardData({
            categories,
            clues,
        })
    }, [gameDataRep])

    return (
        <Board
            data={boardData}
            boardReplicantName="singleJeopardyBoardState"
            width={width}
            height={height}
        ></Board>
    )
}

// const root = createRoot(document.getElementById('root')!)
// root.render(<SingleJeopardy />)
