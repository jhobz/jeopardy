import React, { useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { useReplicant } from '@nodecg/react-hooks'
import { GameState, Player } from '../types/schemas'
import { Round } from '../types/board-types'
import { JeopardyBoard } from '../graphics/JeopardyBoard'
import styled from 'styled-components'

export function Jeopardy() {
    const [gameStateRep] = useReplicant<GameState>('gameState')

    const resetGame = useCallback(() => {
        nodecg.sendMessage('resetBoard')
    }, [])

    const changeRound = useCallback((round: Round) => {
        nodecg.sendMessage('changeRound', round)
    }, [])

    return (
        <>
            <JeopardyBoard width={800} height={600} />
            <br />
            <label htmlFor="roundSelector">Round:</label>
            <select
                id="roundSelector"
                onChange={(e) => {
                    changeRound(e.target.selectedOptions[0].value as Round)
                }}
                value={gameStateRep?.currentRound}
            >
                <option value="single">First round</option>
                <option value="double">Second round</option>
                <option disabled value="final">
                    Final round
                </option>
            </select>
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
        nodecg.sendMessage('clearQuestion')
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
