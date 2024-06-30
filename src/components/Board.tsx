import React, { createRef, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { GameData, GameState } from '../types/schemas'
import { BoardSquare } from './BoardSquare'
import { useListenFor, useReplicant } from '@nodecg/react-hooks'
import { BoardState, Round } from '../types/board-types'

const SquareGrid = styled.div<{
    width: number
    height: number
    $rows?: number
    $cols?: number
}>`
    position: relative;
    display: grid;
    grid-template-columns: repeat(${({ $cols }) => $cols || 6}, minmax(0, 1fr));
    grid-template-rows: repeat(${({ $rows }) => $rows || 6}, minmax(0, 1fr));
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

    &.first-row {
        margin-bottom: 1.5em;
        font-size: 0.8em;
        text-transform: uppercase;
        backface-visibility: hidden;
    }
`

type BoardProps = {
    data: GameData
    round?: Round
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
        clone.style.position = 'absolute'
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

        if (
            gameStateRep.boardDisplayMode === 'intro' &&
            gameStateRep.displayedCategoryIndex !== undefined
        ) {
            const titleElement = gridRef.current?.querySelector(
                `.square-${gameStateRep.displayedCategoryIndex}-${0}`
            )

            if (!gridRef.current || !titleElement) {
                return
            }

            const gridRect = gridRef.current.getBoundingClientRect()
            const titleRect = titleElement.getBoundingClientRect()
            const origin = (gameStateRep.displayedCategoryIndex / 5) * 100
            const xFactor = (gridRect.width + 1) / titleRect.width
            const yFactor = (gridRect.height + 1) / titleRect.height

            gridRef.current.style.setProperty(
                '--origin',
                origin.toString() + '% top'
            )
            gridRef.current.style.setProperty('--xfactor', xFactor.toString())
            gridRef.current.style.setProperty('--yfactor', yFactor.toString())
            gridRef.current.classList.add('intro-feature')
            return
        }

        gridRef.current?.classList.remove('intro-feature')

        if (gameStateRep.boardDisplayMode === 'board' && currentClueElement) {
            currentClueElement.remove()
            setCurrentClueElement(undefined)
        }
    }, [gameStateRep])

    const categories = [...data.categories]
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map((category) => category.name)

    const clues = sortClues(data.clues, data.categories)

    const categorySquares = categories.map((category, index) => (
        <TitleGrouping category={category} index={index} boardName={round} />
    ))

    const clueSquares = clues.map((clue, index) =>
        round === 'final' ? (
            <FinalGrouping key={index} clue={clue} />
        ) : (
            <SquareGrouping
                key={index}
                clue={clue}
                index={index}
                boardName={round}
            />
        )
    )

    return round === 'final' ? (
        <SquareGrid
            width={width}
            height={height}
            ref={gridRef}
            $rows={1}
            $cols={1}
        >
            {...clueSquares}
        </SquareGrid>
    ) : (
        <SquareGrid width={width} height={height} ref={gridRef}>
            {...categorySquares}
            {...clueSquares}
        </SquareGrid>
    )
}

const sortClues = (
    cluesArray: GameData['clues'],
    categories: GameData['categories']
) => {
    // Don't mutate prop
    const clues = [...cluesArray]

    if (!clues.length) {
        return []
    }

    // If we have row & col, use that to sort, otherwise approximate via values
    if (clues[0].row !== undefined) {
        return clues.sort((a, b) => {
            // TS doesn't know that row & column are guaranteed by parser on all clues if on one clue
            //@ts-ignore
            return a.row * 6 + a.column - (b.row * 6 + b.column)
        })
    }

    // Sort by value and then category in order to get everything in the right* order
    // *daily doubles mess things up, so it's not actually guaranteed to be correct.
    // TODO: Figure out how to fix daily doubles.
    return clues.sort(
        (a, b) =>
            a.value - b.value ||
            // TS doesn't know that the category is guaranteed to be found
            //@ts-ignore
            categories.find((cat) => cat.name === a.category)?.index -
                //@ts-ignore
                categories.find((cat) => cat.name === b.category)?.index
    )
}

interface TitleGroupingProps {
    index: number
    category: string
    boardName: string
}
const TitleGrouping: React.FC<TitleGroupingProps> = ({
    index,
    category,
    boardName,
}) => {
    const [boardStatesRep] =
        useReplicant<Record<string, BoardState>>('boardStates')
    const col = index % 6
    const state = boardStatesRep?.[boardName]?.[0]?.[col] ?? 0

    const onCoverClick = useCallback(() => {
        nodecg.sendMessage('titleCoverClicked', {
            category,
            row: 0,
            col,
            boardName,
        })
    }, [category, col, boardName])

    return (
        <SquareGroup
            className={`square-${col}-${0} first-row`}
            $row={1}
            $column={index + 1}
        >
            <BoardSquare
                content={''}
                onClick={onCoverClick}
                type="logo"
                key={category + 'logo'}
                hidden={state > 0}
            />
            <BoardSquare
                content={category}
                type="category"
                key={category + 'category'}
            />
        </SquareGroup>
    )
}

interface FinalGroupingProps {
    clue: GameData['clues'][0]
}
const FinalGrouping: React.FC<FinalGroupingProps> = ({ clue }) => {
    const [boardStatesRep] =
        useReplicant<Record<string, BoardState>>('boardStates')
    const state = boardStatesRep?.['final']?.[0]?.[0] ?? 0

    const onCoverClick = useCallback(() => {
        nodecg.sendMessage('titleCoverClicked', {
            category: clue.category,
            row: 0,
            col: 0,
            boardName: 'final',
        })
        nodecg.sendMessage('playFinalSound')
        nodecg.sendMessage('showFinalQuestion', { clue, row: 0, col: 0 })
    }, [clue.category])

    return (
        <SquareGroup className={`square-${0}-${0}`} $row={1} $column={1}>
            <BoardSquare
                style={{
                    fontSize: '7em',
                    transition: 'none',
                    textTransform: 'uppercase',
                }}
                content={clue.category}
                onClick={onCoverClick}
                type="finalCategory"
                key={'finalcategory'}
                hidden={state > 0}
            />
            <BoardSquare
                style={{ fontSize: '5.6em' }}
                content={clue.question}
                type="clue"
                key={'finalclue'}
            />
        </SquareGroup>
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
    const row = Math.floor(index / 6) + 1
    const col = index % 6
    const state = boardStatesRep?.[boardName]?.[row]?.[col] ?? 0

    const onCoverClick = useCallback(() => {
        nodecg.sendMessage('coverClicked', { clue, row, col, boardName })
    }, [clue, row, col, boardName])

    return (
        <SquareGroup
            $row={row + 1}
            $column={col + 1}
            key={clue.category + clue.value}
        >
            <BoardSquare
                content={clue.value.toString()}
                type="value"
                hidden={state > 0}
                onClick={onCoverClick}
            ></BoardSquare>
            <BoardSquare
                className={`square-${col}-${row}`}
                content={clue.question}
                type="clue"
                hidden={state > 1}
                style={{ fontSize: '0.85em' }}
            />
        </SquareGroup>
    )
}
