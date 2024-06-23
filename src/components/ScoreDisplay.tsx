import React from 'react'
import styled from 'styled-components'

type ScoreDisplayProps = {
    score: number
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
    const formattedScore = score.toLocaleString('en-us')
    return <Score $red={score < 0}>{formattedScore}</Score>
}

const Score = styled.div<{ $red?: boolean }>`
    padding: 0.2em;
    font-family: var(--board-value-font);
    font-size: clamp(1rem, 15vw, 16rem);
    font-weight: 400;
    text-align: center;
    background-color: var(--tile-color);
    color: ${(props) => (props.$red ? 'red' : 'white')};
    text-shadow: calc(1em / 10) calc(1em / 10) calc(1em / 20) #000;
`

export default ScoreDisplay
