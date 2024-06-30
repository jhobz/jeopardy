import React, { useCallback, useEffect, useState } from 'react'
import { Board } from '../components/Board'
import { useListenFor, useReplicant } from '@nodecg/react-hooks'
import { GameData, GameState } from '../types/schemas'
import { Round } from '../types/board-types'
import styled from 'styled-components'

type JeopardyBoardProps = {
    width?: number
    height?: number
    round?: Round
    hideFrame?: boolean
}

export const JeopardyBoard: React.FC<JeopardyBoardProps> = ({
    width = 1442,
    height = 846,
    round = 'single',
    hideFrame = false,
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
        setTimeout(() => {
            nodecg.playSound('timeout')
        }, 150)
        setTimeout(() => {
            nodecg.playSound('timeout')
        }, 300)
    })

    useListenFor('roundOverSound', () => {
        nodecg.playSound('round-over')
        setTimeout(() => {
            nodecg.playSound('round-over')
        }, 400)
        setTimeout(() => {
            nodecg.playSound('round-over')
        }, 800)
    })

    return (
        <>
            {hideFrame ? (
                <Board
                    data={boardData}
                    round={currentRound}
                    width={width}
                    height={height}
                ></Board>
            ) : (
                <Frame>
                    <Border>
                        <Board
                            data={boardData}
                            round={currentRound}
                            width={width}
                            height={height}
                        />
                    </Border>
                </Frame>
            )}
        </>
    )
}

const Frame = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 1672px;
    height: 896px;
    border: 1.5em solid black;
    background: linear-gradient(180deg, #38214a 0%, #0f001b 100%);
    margin: 45px auto auto;
    overflow: hidden;
`

const Border = styled.div`
    width: 1490px;
    height: calc(896px - 3em);
    border-left: 1.5em solid black;
    border-right: 1.5em solid black;
    overflow: hidden;
`
