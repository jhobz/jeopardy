import { useReplicant } from '@nodecg/react-hooks'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { GameState, Player } from '../types/schemas'
import ScoreDisplay from '../components/ScoreDisplay'
import styled from 'styled-components'

export const Teleprompter: React.FC = () => {
    const [gameStateRep] = useReplicant<GameState>('gameState')
    const [playersRep] = useReplicant<Player[]>('players')
    const [activeBuzzerRep] = useReplicant<number | null>('activeBuzzer')
    const [buzzedInPlayer, setBuzzedInPlayer] = useState<string | null>(null)

    return (
        <FlexRow style={{ height: '100vh' }}>
            <FlexColumn>
                <div>
                    <h2>Current Clue</h2>
                    <p>
                        <span>
                            {(
                                gameStateRep?.currentClue as GameState['currentClue']
                            )?.question ?? ''}
                        </span>
                    </p>
                    <p>
                        <b>Correct response: </b>
                        <span>
                            {(
                                gameStateRep?.currentClue as GameState['currentClue']
                            )?.answer ?? ''}
                        </span>
                    </p>
                    <p>
                        <b>Value: </b>
                        <span>
                            {(
                                gameStateRep?.currentClue as GameState['currentClue']
                            )?.value ?? ''}
                        </span>
                    </p>
                    <p>
                        <b>Supporting details: </b>
                        <span>
                            {((
                                gameStateRep?.currentClue as GameState['currentClue']
                            )?.details as string) ?? ''}
                        </span>
                    </p>
                </div>
                <div>
                    <h2>Buzzer</h2>
                    {activeBuzzerRep === null ||
                    activeBuzzerRep === undefined ? (
                        <p>-</p>
                    ) : (
                        <p style={{ color: 'red' }}>
                            {playersRep?.find(
                                (x) => x.controller === activeBuzzerRep
                            )?.name || 'No player set'}
                        </p>
                    )}
                </div>
            </FlexColumn>
            <div>
                <div>
                    <h2>Leaderboard</h2>
                    {[...(playersRep || [])]
                        .sort((a, b) => (b.points || 0) - (a.points || 0))
                        .map((player) => {
                            return (
                                <p>
                                    {player.name} - {player.points}
                                </p>
                            )
                        })}
                    <br />
                    <h3>Round 1 Players</h3>
                    {playersRep?.slice(0, 3).map((player) => {
                        return (
                            <p>
                                {player.name} - {player.points}
                            </p>
                        )
                    })}
                    <br />
                    <h3>Round 2 Players</h3>
                    {playersRep?.slice(3).map((player) => {
                        return (
                            <p>
                                {player.name} - {player.points}
                            </p>
                        )
                    })}
                </div>
            </div>
        </FlexRow>
    )
}

const FlexRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    gap: 50px;
    padding: 25px;

    & > * {
        flex: 1;
    }
`

const FlexColumn = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 50px;

    & p {
        margin-bottom: 0.5em;
    }
`

const root = createRoot(document.getElementById('root')!)
root.render(<Teleprompter />)
