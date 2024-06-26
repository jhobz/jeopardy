import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useReplicant } from '@nodecg/react-hooks'
import { createRoot } from 'react-dom/client'
import { GameState, Player } from '../types/schemas'

export const BuzzerControls = () => {
    const [activeBuzzer] = useReplicant<number | null>('activeBuzzer', {
        defaultValue: null,
    })
    const [playersRep] = useReplicant<Player[]>('players')

    const handleResetBuzzer = useCallback(() => {
        nodecg.sendMessage('buzzerReset')
    }, [])

    return (
        <Container>
            <ActiveLabel>
                {activeBuzzer === null || activeBuzzer === undefined
                    ? '-'
                    : playersRep?.find((x) => x.controller === activeBuzzer)
                          ?.name || 'No player set'}
            </ActiveLabel>
            <ActiveSublabel>
                {activeBuzzer === null || activeBuzzer === undefined
                    ? '-'
                    : `Controller ${activeBuzzer + 1}`}
            </ActiveSublabel>
            <ResetButton onClick={handleResetBuzzer}>Clear</ResetButton>
        </Container>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<BuzzerControls />)

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ActiveLabel = styled.div`
    font-size: 1.5rem;
    margin-bottom: 0.75em;
`

const ActiveSublabel = styled.div`
    margin-bottom: 2em;
`

const ResetButton = styled.button`
    font-size: 1.25rem;
    padding: 0.5em;
`
