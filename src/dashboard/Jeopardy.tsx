import React, { useCallback, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { useReplicant } from '@nodecg/react-hooks'
import { GameData } from '../types/schemas'
import { BoardState } from '../types/board-types'
import { SingleJeopardy } from '../graphics/SingleJeopardy'

export function Jeopardy() {
    const [gameDataRep] = useReplicant<GameData>('gameData')
    const [singleJeopardyBoardStateRep, setSingleJeopardyBoardStateRep] =
        useReplicant<BoardState>('singleJeopardyBoardState')

    const resetGame = useCallback(() => {
        setSingleJeopardyBoardStateRep(
            new Array(5).fill(new Array<number>(6).fill(0))
        )
    }, [setSingleJeopardyBoardStateRep])

    return (
        <>
            <SingleJeopardy width={800} height={600}></SingleJeopardy>
            <br />
            <button
                onClick={(e) => {
                    resetGame()
                }}
            >
                Reset Game
            </button>
        </>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Jeopardy />)
