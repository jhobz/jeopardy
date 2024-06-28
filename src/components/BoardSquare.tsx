import React, { HTMLProps } from 'react'
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

const BoardSquareTitleCoverElement = styled(BoardSquareElement)`
    position: absolute;
    z-index: 1;
    inset: 0;
    padding: 0.4em;

    // Override hidden behavior
    display: flex;
    opacity: ${({ hidden }) => (hidden ? 0 : 1)};
    transition: opacity 0.5s;
`

type BoardSquareProps = {
    type: 'category' | 'clue' | 'value' | 'logo' | 'finalCategory'
    content: string
    hidden?: boolean
    onClick?: (e: React.MouseEvent) => void
    className?: string
}

export const BoardSquare = React.forwardRef<
    HTMLParagraphElement,
    BoardSquareProps & HTMLProps<HTMLParagraphElement>
>(({ type, content, hidden, onClick, className, style }, ref) => {
    switch (type) {
        case 'finalCategory':
            return (
                <BoardSquareTitleCoverElement
                    style={style}
                    className={className}
                    onClick={onClick}
                    hidden={!!hidden}
                    ref={ref}
                >
                    {content}
                </BoardSquareTitleCoverElement>
            )
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
        case 'logo':
            return (
                <BoardSquareTitleCoverElement
                    className={className + ' board-category-cover'}
                    onClick={onClick}
                    hidden={!!hidden}
                    ref={ref}
                >
                    <img
                        src="images/logo.png"
                        style={{ height: '100%', objectFit: 'contain' }}
                    ></img>
                </BoardSquareTitleCoverElement>
            )
        case 'clue':
            return (
                <BoardSquareElement
                    style={style}
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
