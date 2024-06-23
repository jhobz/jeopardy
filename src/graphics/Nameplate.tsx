import { useReplicant } from '@nodecg/react-hooks'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Player } from '../types/schemas'
import ScoreDisplay from '../components/ScoreDisplay'
import styled from 'styled-components'

export const Nameplate: React.FC = () => {
    const [playersRep] = useReplicant<Player[]>('players')
    const index = new URLSearchParams(window.location.search).get('index')

    if (!index) return <div>No index query parameter specified.</div>

    const player = playersRep?.find((x) => x.id === Number(index))

    if (!player) return null

    return (
        <Container>
            <ScoreDisplay score={player.points || 0}></ScoreDisplay>
            <Image src={player.nameplateImage} />
        </Container>
    )
}

const Container = styled.div`
    --border-width: 2vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: black;
    gap: var(--border-width);
    border: var(--border-width) solid black;
`

const Image = styled.img`
    min-width: 300px;
    width: 100%;
    aspect-ratio: calc(140 / 94);
`

const root = createRoot(document.getElementById('root')!)
root.render(<Nameplate />)
