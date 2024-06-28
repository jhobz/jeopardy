import { useListenFor } from '@nodecg/react-hooks'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Player } from '../types/schemas'
import ScoreDisplay from '../components/ScoreDisplay'
import styled from 'styled-components'

export const FinalBids: React.FC = () => {
    const [scoreToDisplay, setScoreToDisplay] = useState<number>(0)
    const [hidden, setHidden] = useState<boolean>(true)

    useListenFor<{ player: Player; bid: number }>(
        'showBid',
        ({ player, bid }) => {
            if (!player || !bid) {
                console.error(
                    'Tried to show bid but player or bid was not found!',
                    player,
                    bid
                )
                return
            }

            setScoreToDisplay(bid)
            setHidden(false)
        }
    )

    useListenFor('hideBid', () => {
        setHidden(true)
    })

    useListenFor<{ player: Player }>('showTotal', ({ player }) => {
        if (player.points === undefined) {
            console.error('Player points not found!', player)
            return
        }

        setScoreToDisplay(player.points)
        setHidden(false)
    })

    return (
        <Container $hidden={hidden}>
            <ScoreDisplay score={scoreToDisplay} />
        </Container>
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

const root = createRoot(document.getElementById('root')!)
root.render(<FinalBids />)
