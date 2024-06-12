import React from 'react'
import styled from 'styled-components'

const BoardSquareElement = styled.div`
    --tile-color: blue;
    display: grid;
    inset: 0;
    padding: 2em;
    background-color: var(--tile-color);
`

type BoardSquareProps = {
    type: 'category' | 'clue' | 'value'
    content: string
}

export const BoardSquare: React.FC<BoardSquareProps> = ({ type, content }) => {
    return <div>{content}</div>
}
