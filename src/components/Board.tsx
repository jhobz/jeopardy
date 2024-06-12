import React from 'react'
import styled from 'styled-components'
import { GameData } from '../types/schemas'
import { BoardSquare } from './BoardSquare'

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

type BoardProps = {
    data: GameData
}

export const Board: React.FC<BoardProps> = ({ data }) => {
    const categories = [...data.categories]
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map((category) => category.name)

    const clues = [...data.clues].sort(
        (a, b) =>
            a.value - b.value ||
            //@ts-ignore
            data.categories.find((cat) => cat.name === a.category)?.index -
                //@ts-ignore
                data.categories.find((cat) => cat.name === b.category)?.index
    )

    const categorySquares = categories.map((category) => {
        return (
            <BoardSquare content={category} type={'category'} key={category} />
        )
    })

    const clueSquares = clues.map((clue) => {
        return (
            <BoardSquare
                content={clue.question}
                type={'clue'}
                key={clue.category + clue.value}
            />
        )
    })

    return (
        <SquareGrid>
            {...categorySquares}
            {...clueSquares}
        </SquareGrid>
    )
}
