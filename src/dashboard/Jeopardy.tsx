import React, { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useReplicant } from '@nodecg/react-hooks'
import { GameState, Player } from '../types/schemas'
import { Round } from '../types/board-types'
import { JeopardyBoard } from '../graphics/JeopardyBoard'
import styled from 'styled-components'

export function Jeopardy() {
    return (
        <>
            <div
                style={{ width: '800px', height: '600px', overflow: 'hidden' }}
            >
                <JeopardyBoard width={800} height={600} />
            </div>
            <br />
            <FlexRow>
                <QuestionControls />
                <ModeControls />
            </FlexRow>
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

type DisplayMode = 'intro' | 'board' | 'question'

const ModeControls = () => {
    const [gameStateRep] = useReplicant<GameState>('gameState')
    const [resetBlock, setResetBlock] = useState<boolean>(true)

    const changeMode = useCallback((mode: DisplayMode) => {
        nodecg.sendMessage('changeMode', mode)
    }, [])

    const nextCategory = useCallback(() => {
        nodecg.sendMessage('nextCategory')
    }, [])

    const changeRound = useCallback((round: Round) => {
        nodecg.sendMessage('changeRound', round)
    }, [])

    const resetRound = useCallback(() => {
        nodecg.sendMessage('resetBoard')
    }, [])

    return (
        <div style={{ fontSize: '16px' }}>
            <h2>Mode Controls</h2>
            <fieldset style={{ padding: '0.5em' }}>
                <label htmlFor="modeSelector">Mode</label>
                <br />
                <select
                    id="modeSelector"
                    onChange={(e) => {
                        changeMode(
                            e.target.selectedOptions[0].value as DisplayMode
                        )
                    }}
                    value={gameStateRep?.boardDisplayMode}
                >
                    <option value="intro">Intro</option>
                    <option value="board">Board</option>
                </select>
                <br />
                <button
                    disabled={
                        gameStateRep?.boardDisplayMode !== 'intro' ||
                        gameStateRep?.displayedCategoryIndex === undefined ||
                        gameStateRep?.displayedCategoryIndex >= 5
                    }
                    onClick={(e) => {
                        nextCategory()
                    }}
                >
                    Move to next category
                </button>
                <br />
                <br />
                <label htmlFor="roundSelector">Round</label>
                <br />
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
                <br />
                <FlexRow>
                    <span>
                        <label htmlFor="resetControl">🔒</label>
                        <input
                            id="resetControl"
                            type="checkbox"
                            checked={resetBlock}
                            onChange={() => {
                                setResetBlock(!resetBlock)
                            }}
                        />
                    </span>
                    <button
                        disabled={resetBlock}
                        onClick={(e) => {
                            resetRound()
                        }}
                    >
                        Reset Round
                    </button>
                </FlexRow>
            </fieldset>
        </div>
    )
}

const FlexRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`

const root = createRoot(document.getElementById('root')!)
root.render(<Jeopardy />)
