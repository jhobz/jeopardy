import React, { useEffect } from 'react'
import { useReplicant } from '@nodecg/react-hooks'
import { GameData } from '../types/schemas'

export function Jeopardy() {
    const [gameDataRep] = useReplicant<GameData>('gameData')

    useEffect(() => {
        console.log(gameDataRep?.clues)
        console.log(gameDataRep?.categories)
    }, [gameDataRep])

    return <></>
}
