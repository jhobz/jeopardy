import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { GameData } from '../types/schemas'
import { BoardSquare } from './BoardSquare'
import { useReplicant } from '@nodecg/react-hooks'

type BoardState = Array<Array<0 | 1 | 2>>

const SquareGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(6, 1fr);
    row-gap: 10px;
    column-gap: 5px;
    justify-items: stretch;
    align-items: stretch;
    width: 1920px;
    height: 1080px;
    background-color: black;
    color: white;
`

const SquareGroup = styled.div`
    display: flex;
    position: relative;
`

type BoardProps = {
    data: GameData
    boardReplicantName: string
}

export const Board: React.FC<BoardProps> = ({ data, boardReplicantName }) => {
    const [boardStateRep, setBoardStateRep] =
        useReplicant<BoardState>(boardReplicantName)
    const [boardState, setBoardState] = useState<BoardState>(
        new Array(5).fill(new Array<number>(6).fill(0))
    )

    useEffect(() => {
        if (!boardStateRep) {
            return
        }

        setBoardState(boardStateRep)
    }, [boardStateRep])

    const categories = [...data.categories]
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map((category) => category.name)

    // Sort by value and then category in order to get everything in the right order
    const clues = [...data.clues].sort(
        (a, b) =>
            a.value - b.value ||
            //@ts-ignore
            data.categories.find((cat) => cat.name === a.category)?.index -
                //@ts-ignore
                data.categories.find((cat) => cat.name === b.category)?.index
    )

    const categorySquares = categories.map((category) => {
        return <BoardSquare content={category} type="category" key={category} />
    })

    const clueSquares = clues.map((clue, index) => {
        const row = index % 5
        const col = Math.floor(index / 5)
        const state = boardState[row][col]

        const onCoverClick = (e: React.MouseEvent) => {
            const newState = deepCopy(boardState)
            newState[row][col] = state + 1
            setBoardStateRep(newState)
        }

        return (
            <SquareGroup>
                <BoardSquare
                    content={clue.value.toString()}
                    type="value"
                    hidden={state > 0 ? true : false}
                    onClick={onCoverClick}
                    key={clue.category + clue.value + 'cover'}
                ></BoardSquare>
                <BoardSquare
                    content={clue.question}
                    type="clue"
                    hidden={state > 1 ? true : false}
                    key={clue.category + clue.value}
                />
            </SquareGroup>
        )
    })

    return (
        <SquareGrid>
            {...categorySquares}
            {...clueSquares}
        </SquareGrid>
    )
}

const deepCopy = (arr: Array<Array<number>>) => {
    const clone = new Array(arr.length)

    for (let i = 0; i < arr.length; i++) {
        clone[i] = arr[i].slice()
    }

    return clone
}
