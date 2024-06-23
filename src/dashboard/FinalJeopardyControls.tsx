import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useReplicant } from '@nodecg/react-hooks'
import { createRoot } from 'react-dom/client'
import { Player } from '../types/schemas'

interface FinalJeopardyRowProps {
    player: Player
}

const FinalJeopardyRow: React.FC<FinalJeopardyRowProps> = ({ player }) => {
    const [bid, setBid] = useState(player.finalJeopardyBid || 0)

    const handleUpdateBid = useCallback(() => {
        nodecg.sendMessage('updatePlayer', { ...player, finalJeopardyBid: bid })
    }, [player, bid])

    const handleCorrectBid = useCallback(() => {
        nodecg.sendMessage('updatePlayer', {
            ...player,
            points: (player.points || 0) + bid,
        })
    }, [player, bid])

    const handleIncorrectBid = useCallback(() => {
        nodecg.sendMessage('updatePlayer', {
            ...player,
            points: (player.points || 0) - bid,
        })
    }, [player, bid])

    const handleShowBid = useCallback(() => {
        nodecg.sendMessage('showBid', { id: player.id, bid })
    }, [bid, player.id])

    return (
        <FinalJeopardyRowContainer>
            <PlayerName>
                <span>
                    {player.name} - {player.points || 0}
                </span>
                <ShowBidButton onClick={handleShowBid}>Show Bid</ShowBidButton>
            </PlayerName>
            <div>
                <label>bid</label>
                <input
                    type="number"
                    value={bid}
                    onChange={(e) => {
                        setBid(Number(e.target.value))
                    }}
                    onBlur={handleUpdateBid}
                />
            </div>
            <ActionRow>
                <button onClick={handleCorrectBid}>✅ Correct</button>
                <button onClick={handleIncorrectBid}>❌ Incorrect</button>
            </ActionRow>
        </FinalJeopardyRowContainer>
    )
}

export const FinalJeopardyControls = () => {
    const [playersRep] = useReplicant<Player[]>('players')

    return (
        <Container>
            {playersRep?.map((player, index) => (
                <FinalJeopardyRow key={index} player={player} />
            ))}
        </Container>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<FinalJeopardyControls />)

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 1.5rem;
`

const PlayerName = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
`

const FinalJeopardyRowContainer = styled.div`
    & label {
        margin-right: 0.5rem;
    }

    & + & {
        padding-top: 1rem;
        border-top: 1px solid #fff;
        margin-top: 1rem;
    }
`

const ActionRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 0.5rem;
`

const ShowBidButton = styled.button`
    margin-left: auto;
`
