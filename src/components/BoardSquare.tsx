import React from 'react'
import styled from 'styled-components'

const BoardSquareElement = styled.p`
    --tile-color: blue;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 2em;
    background-color: var(--tile-color);
`

type BoardSquareProps = {
    type: 'category' | 'clue' | 'value'
    content: string
}

export const BoardSquare: React.FC<BoardSquareProps> = ({ type, content }) => {
    return <BoardSquareElement>{content}</BoardSquareElement>
}
