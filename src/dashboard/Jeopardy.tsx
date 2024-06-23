import React, { useCallback, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { useReplicant } from '@nodecg/react-hooks'
import { GameData, GameState, Player } from '../types/schemas'
import { BoardState } from '../types/board-types'
import { SingleJeopardy } from '../graphics/SingleJeopardy'
import styled from 'styled-components'

const STATE_BOARD_NAME = 'singleJeopardyBoardState'

export function Jeopardy() {
    const resetGame = useCallback(() => {
        nodecg.sendMessage('resetBoard', {
            boardName: STATE_BOARD_NAME,
        })
    }, [])

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
            <br />
            <QuestionControls />
        </>
    )
}

const QuestionControls = () => {
    const [gameStateRep] = useReplicant<GameState>('gameState')
    const [playersRep] = useReplicant<Player[]>('players')

    const playerControls =
        playersRep?.map((player) => {
            return <PlayerAnswerControl player={player}></PlayerAnswerControl>
        }) || []

    const clearQuestion = useCallback(() => {
        nodecg.sendMessage('clearQuestion', { boardName: STATE_BOARD_NAME })
    }, [])

    return (
        <QuestionControlsWrapper>
            <h2>Question Controls</h2>
            <QuestionControlsFieldset disabled={!gameStateRep?.answerControls}>
                <button onClick={() => clearQuestion()}>Clear Question</button>
                {...playerControls}
            </QuestionControlsFieldset>
        </QuestionControlsWrapper>
    )
}

const PlayerAnswerControl: React.FC<{ player: Player }> = ({ player }) => {
    const onAnswer = useCallback(
        (isCorrect: boolean) => {
            nodecg.sendMessage('playerAnswer', {
                player: player.id,
                isCorrect,
                boardName: STATE_BOARD_NAME,
            })
        },
        [player]
    )

    return (
        <FlexRow>
            <span>{player.name}</span>
            <span>
                <button onClick={() => onAnswer(true)}>✅</button>
                <button onClick={() => onAnswer(false)}>❌</button>
            </span>
        </FlexRow>
    )
}

const QuestionControlsWrapper = styled.div`
    font-size: 16px;
`

const QuestionControlsFieldset = styled.fieldset`
    padding: 0.5em;
    width: 200px;

    & > *:not(:first-child) {
        margin-top: 10px;
    }
`

const FlexRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const root = createRoot(document.getElementById('root')!)
root.render(<Jeopardy />)
