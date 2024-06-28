import { useListenFor, useReplicant } from '@nodecg/react-hooks'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { GameData, Player } from '../types/schemas'
import ScoreDisplay from '../components/ScoreDisplay'
import styled from 'styled-components'

export const FinalBids: React.FC = () => {
    const [scoreToDisplay, setScoreToDisplay] = useState<number>(0)
    const [hidden, setHidden] = useState<boolean>(true)
    const [finalQuestion, setFinalQuestion] = useState<string | undefined>()
    const [gameDataRep] = useReplicant<GameData>('gameData')

    useListenFor<{ player: Player; bid: number }>(
        'showBid',
        ({ player, bid }) => {
            if (!player || bid === undefined) {
                console.error(
                    'Tried to show bid but player or bid was not found!',
                    player,
                    bid
                )
                return
            }

            setFinalQuestion(undefined)
            setScoreToDisplay(bid)
            setHidden(false)
        }
    )

    useListenFor('hideBid', () => {
        setFinalQuestion(undefined)
        setHidden(true)
    })

    useListenFor<{ player: Player }>('showTotal', ({ player }) => {
        if (player.points === undefined) {
            console.error('Player points not found!', player)
            return
        }

        setFinalQuestion(undefined)
        setScoreToDisplay(player.points)
        setHidden(false)
    })

    useListenFor('showFinalQuestion', () => {
        if (!gameDataRep || !gameDataRep.clues.length) {
            console.error('No final question found!')
            return
        }

        const finalClue = gameDataRep.clues.find(
            (clue) => clue.round === 'final'
        )
        if (!finalClue) {
            console.error('No final question found!')
            return
        }

        setFinalQuestion(finalClue.question)
        setHidden(false)
    })

    return (
        <>
            {finalQuestion ? (
                <FinalQuestionDisplay>{finalQuestion}</FinalQuestionDisplay>
            ) : (
                <Container $hidden={hidden}>
                    {' '}
                    <ScoreDisplay score={scoreToDisplay} />{' '}
                </Container>
            )}
        </>
    )
}

const Container = styled.div<{ $hidden: boolean }>`
    --border-width: 2vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: black;
    gap: var(--border-width);
    border: var(--border-width) solid black;
    opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
    transition: opacity 0.25s linear;
`

const FinalQuestionDisplay = styled.div`
    font-size: 3rem;
    font-family: var(--board-font);
    font-weight: 800;
    text-shadow: calc(1em / 10) calc(1em / 10) calc(1em / 20) #000;
    padding: 2em 15%;
    color: white;
    background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        var(--tile-color) 15%,
        var(--tile-color) 85%,
        rgba(255, 255, 255, 0) 100%
    );
    text-align: center;
`

const root = createRoot(document.getElementById('root')!)
root.render(<FinalBids />)
