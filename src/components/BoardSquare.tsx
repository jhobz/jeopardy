import React from 'react'
import styled from 'styled-components'

const BoardSquareElement = styled.p<{ hidden: boolean }>`
    --tile-color: blue;
    display: ${(props) => (props.hidden ? 'none' : 'flex')};
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 1em;
    background-color: var(--tile-color);
    width: 100%;
`

const BoardSquareCoverElement = styled(BoardSquareElement)`
    position: absolute;
    z-index: 1;
    inset: 0;
`

type BoardSquareProps = {
    type: 'category' | 'clue' | 'value'
    content: string
    hidden?: boolean
    onClick?: (e: React.MouseEvent) => void
}

export const BoardSquare: React.FC<BoardSquareProps> = ({
    type,
    content,
    hidden,
    onClick,
}) => {
    return type === 'value' ? (
        <BoardSquareCoverElement onClick={onClick} hidden={!!hidden}>
            {content}
        </BoardSquareCoverElement>
    ) : (
        <BoardSquareElement onClick={onClick} hidden={!!hidden}>
            {content}
        </BoardSquareElement>
    )
}
