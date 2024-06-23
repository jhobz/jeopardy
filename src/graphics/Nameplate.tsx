import { useReplicant } from '@nodecg/react-hooks'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Player } from '../types/schemas'
import ScoreDisplay from '../components/ScoreDisplay'
import styled from 'styled-components'

export const Nameplate: React.FC = () => {
    const [playersRep] = useReplicant<Player[]>('players')
    const params = new URLSearchParams(window.location.search)
    const index = params.get('index')
    const spacer = params.get('spacer')

    if (!index) return <div>No index query parameter specified.</div>

    const player = playersRep?.find((x) => x.id === Number(index))

    if (!player) return null

    return (
        <Container $spacer={spacer !== '0'}>
            <ScoreDisplay score={player.points || 0} />
            {spacer === '0' ? <></> : <Spacer />}
            <Image src={player.nameplateImage} />
            {spacer === '0' ? <></> : <Spacer />}
        </Container>
    )
}

const Spacer = styled.div`
    flex-basis: 0;
    background: linear-gradient(0deg, var(--tile-color), black);
    flex-grow: 1;
    justify-self: stretch;
`

const Container = styled.div<{ $spacer: boolean }>`
    --border-width: 2vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: ${(props) => (props.$spacer ? '100vh' : 'auto')};
    background-color: black;
    gap: var(--border-width);
    border: var(--border-width) solid black;
`

const Image = styled.img`
    min-width: 200px;
    width: 100%;
    aspect-ratio: calc(200 / 136);
    overflow: hidden;
`

const root = createRoot(document.getElementById('root')!)
root.render(<Nameplate />)
