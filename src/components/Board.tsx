import React, { createRef, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { GameData, GameState } from '../types/schemas'
import { BoardSquare } from './BoardSquare'
import { useListenFor, useReplicant } from '@nodecg/react-hooks'
import { BoardState } from '../types/board-types'

const SquareGrid = styled.div<{ width: number; height: number }>`
    position: relative;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(0, 1fr));
    row-gap: 0.5em;
    column-gap: 0.5em;
    justify-items: stretch;
    align-items: stretch;
    width: ${(props) => props.width + 'px'};
    height: ${(props) => props.height + 'px'};
    background-color: black;
    color: white;
    overflow: hidden;
`

const SquareGroup = styled.div<{
    $row: number
    $column: number
}>`
    display: flex;
    position: relative;
    grid-row: ${(props) => props.$row};
    grid-column: ${(props) => props.$column};
    background-color: var(--tile-color);
`

type BoardProps = {
    data: GameData
    round?: 'single' | 'double' | 'final'
    width?: number
    height?: number
}

export const Board: React.FC<BoardProps> = ({
    data,
    round = 'single',
    width = 1920,
    height = 1080,
}) => {
    const [gameStateRep] = useReplicant<GameState>('gameState')
    const gridRef = createRef<HTMLDivElement>()
    const [currentClueElement, setCurrentClueElement] = useState<HTMLElement>()

    useListenFor<{
        clue: GameData['clues'][0]
        row: number
        col: number
        ref: React.RefObject<HTMLElement>
    }>('showQuestion', ({ row, col }) => {
        console.log('showQuestion')

        const squareElement = gridRef.current?.querySelector(
            `.square-${col}-${row}`
        )
        if (!squareElement || !gridRef.current) {
            return
        }
        const clone = squareElement?.cloneNode(true) as HTMLElement
        gridRef.current.appendChild(clone)
        const rect = squareElement.getBoundingClientRect()
        const gridRect = gridRef.current.getBoundingClientRect()
        clone.classList.add('featured')
        clone.style.setProperty('--width', rect.width + 'px')
        clone.style.setProperty('--height', rect.height + 'px')
        clone.style.setProperty('--left', rect.left - gridRect.left + 'px')
        clone.style.setProperty('--top', rect.top - gridRect.top + 'px')
        clone.style.setProperty(
            '--xfactor',
            ((gridRect.width + 1) / rect.width).toString()
        )
        clone.style.setProperty(
            '--yfactor',
            ((gridRect.height + 1) / rect.height).toString()
        )
        clone.classList.add('animate')
        setCurrentClueElement(clone)
    })

    useEffect(() => {
        if (!gameStateRep) {
            return
        }

        if (gameStateRep.boardDisplayMode === 'board' && currentClueElement) {
            currentClueElement.remove()
            setCurrentClueElement(undefined)
        }
    }, [gameStateRep])

    const categories = [...data.categories]
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map((category) => category.name)

    // Sort by value and then category in order to get everything in the right* order
    const clues = [...data.clues].sort(
        (a, b) =>
            a.value - b.value ||
            //@ts-ignore
            data.categories.find((cat) => cat.name === a.category)?.index -
                //@ts-ignore
                data.categories.find((cat) => cat.name === b.category)?.index
    )

    const categorySquares = categories.map((category, index) => {
        return (
            <SquareGroup $row={1} $column={index + 1}>
                <BoardSquare
                    content={category}
                    type="category"
                    key={category}
                />
            </SquareGroup>
        )
    })

    const clueSquares = clues.map((clue, index) => (
        <SquareGrouping
            key={index}
            clue={clue}
            index={index}
            boardName={round}
        />
    ))

    return (
        <SquareGrid width={width} height={height} ref={gridRef}>
            {...categorySquares}
            {...clueSquares}
        </SquareGrid>
    )
}

interface SquareGroupingProps {
    clue: GameData['clues'][0]
    index: number
    boardName: string
}
const SquareGrouping: React.FC<SquareGroupingProps> = ({
    clue,
    index,
    boardName,
}) => {
    const [boardStatesRep] =
        useReplicant<Record<string, BoardState>>('boardStates')
    const row = Math.floor(index / 6)
    const col = index % 6
    const state = boardStatesRep?.[boardName]?.[row]?.[col] ?? 0

    const onCoverClick = useCallback(
        (e: React.MouseEvent) => {
            nodecg.sendMessage('coverClicked', { clue, row, col, boardName })
        },
        [clue, row, col, boardName]
    )

    return (
        <SquareGroup
            $row={row + 2}
            $column={col + 1}
            key={clue.category + clue.value}
        >
            <BoardSquare
                content={clue.value.toString()}
                type="value"
                hidden={state > 0 ? true : false}
                onClick={onCoverClick}
            ></BoardSquare>
            <BoardSquare
                className={`square-${col}-${row}`}
                content={clue.question}
                type="clue"
                hidden={state > 1 ? true : false}
            />
        </SquareGroup>
    )
}
