import React from 'react'
import styled from 'styled-components'

const BoardSquareElement = styled.p<{ hidden: boolean }>`
    display: ${(props) => (props.hidden ? 'none' : 'flex')};
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 1em;
    background-color: var(--tile-color);
    font-family: var(--board-font);
    font-weight: 800;
    text-shadow: calc(1em / 10) calc(1em / 10) calc(1em / 20) #000;
    width: 100%;
`

const BoardSquareCoverElement = styled(BoardSquareElement)`
    position: absolute;
    z-index: 1;
    inset: 0;
    padding: 0.2em 0.2em 0.2em 0.4em;
    font-family: var(--board-value-font);
    font-size: 4rem;
    font-weight: 400;
`

const BoardSquareTitleElement = styled(BoardSquareElement)`
    font-size: 2em;
    margin-bottom: 0.5rem;
`

type BoardSquareProps = {
    type: 'category' | 'clue' | 'value'
    content: string
    hidden?: boolean
    onClick?: (e: React.MouseEvent) => void
    className?: string
}

export const BoardSquare = React.forwardRef<
    HTMLParagraphElement,
    BoardSquareProps
>(({ type, content, hidden, onClick, className }, ref) => {
    switch (type) {
        case 'category':
            return (
                <BoardSquareTitleElement
                    className={className}
                    onClick={onClick}
                    hidden={!!hidden}
                    ref={ref}
                >
                    {content}
                </BoardSquareTitleElement>
            )
        case 'clue':
            return (
                <BoardSquareElement
                    className={className}
                    onClick={onClick}
                    hidden={!!hidden}
                    ref={ref}
                >
                    {content}
                </BoardSquareElement>
            )
        case 'value':
            return (
                <BoardSquareCoverElement
                    className={className}
                    onClick={onClick}
                    hidden={!!hidden}
                    ref={ref}
                >
                    {content}
                </BoardSquareCoverElement>
            )
    }
})
