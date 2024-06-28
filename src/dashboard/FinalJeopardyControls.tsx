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
        nodecg.sendMessage('showBid', { player, bid })
    }, [bid, player])

    const handleShowTotal = useCallback(() => {
        nodecg.sendMessage('showTotal', { player })
    }, [player])

    return (
        <FinalJeopardyRowContainer>
            <PlayerName>
                <span>
                    {player.name} - {player.points || 0}
                </span>
            </PlayerName>
            <ActionRow>
                <label>bid</label>
                <input
                    type="number"
                    value={bid}
                    onChange={(e) => {
                        setBid(Number(e.target.value))
                    }}
                    onBlur={handleUpdateBid}
                />
                <Button onClick={handleShowBid}>👁 Show Bid</Button>
            </ActionRow>
            <ActionRow>
                <Button onClick={handleCorrectBid}>✅ Correct</Button>
                <Button onClick={handleIncorrectBid}>❌ Incorrect</Button>
            </ActionRow>
            <br />
            <ActionRow>
                <Button onClick={handleShowTotal}>💲 Show Total</Button>
            </ActionRow>
        </FinalJeopardyRowContainer>
    )
}

export const FinalJeopardyControls = () => {
    const [playersRep] = useReplicant<Player[]>('players')

    const handleHideBid = useCallback(() => {
        nodecg.sendMessage('hideBid')
    }, [])

    return (
        <Container>
            <Button
                onClick={handleHideBid}
                style={{ position: 'absolute', top: '1em', right: '1em' }}
            >
                ✖ Hide All
            </Button>
            <br />
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
    align-items: stretch;

    & > h2 {
        margin-bottom: 0.5em;
    }
`

const PlayerName = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.75em;
`

const FinalJeopardyRowContainer = styled.div`
    & > :not(:first-child) {
        margin-left: 1rem;
    }

    & label {
        margin-right: 0.5rem;
    }

    & input {
        width: 100px;
    }

    & + & {
        padding-top: 1rem;
        border-top: 1px solid #fff;
        margin-top: 1rem;
        margin-right: 0.5rem;
    }
`

const ActionRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.5rem;
    margin-top: 0.5rem;
`

const Button = styled.button`
    min-width: 100px;
    padding: 0.2em 0.4em;
    /* margin-left: auto; */
`
