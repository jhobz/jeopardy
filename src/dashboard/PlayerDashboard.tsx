import React, { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useReplicant } from '@nodecg/react-hooks'
import { Player } from '../types/schemas'
import styled from 'styled-components'
import { NodeCG } from '@nodecg/types/types/nodecg'

const PlayerAttribute = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: stretch;

    & > :first-child {
        flex: 50px 0 0;
    }

    & > :last-child {
        flex: 250px 1 1;
    }

    & select {
        max-width: 200px;
    }
`

const PlayerElement = styled.div`
    min-width: 300px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2px;
`

const PlayerContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px;
    margin-left: 0;
    gap: 10px;
`

type PlayerDisplayProps = {
    player: Player
    saveChanges: (player: Player) => void
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({
    player,
    saveChanges,
}) => {
    const [nameplateOptions] =
        useReplicant<NodeCG.AssetFile[]>('assets:nameplates')
    const [id, setId] = useState<number>(player.id)
    const [name, setName] = useState<string>(player.name)
    const [points, setPoints] = useState<number>(player.points || 0)
    const [controller, setController] = useState<number>(player.controller || 0)
    const [nameplate, setNameplate] = useState<string | undefined>(
        player.nameplateImage
    )

    const save = () => {
        saveChanges({ id, name, points, controller, nameplateImage: nameplate })
    }

    // Override local state if the props ever change
    useEffect(() => {
        setId(player.id)
        setName(player.name)
        setPoints(player.points || 0)
    }, [player])

    return (
        <PlayerElement>
            <PlayerAttribute>
                <label>id</label>
                <span>{id}</span>
            </PlayerAttribute>
            <PlayerAttribute>
                <label>name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                    onBlur={save}
                />
            </PlayerAttribute>
            <PlayerAttribute>
                <label>points</label>
                <input
                    type="number"
                    value={points}
                    onChange={(e) => {
                        setPoints(parseInt(e.target.value))
                    }}
                    onBlur={save}
                />
            </PlayerAttribute>
            <PlayerAttribute>
                <label>controller</label>
                <input
                    type="number"
                    value={controller}
                    onChange={(e) => {
                        setController(parseInt(e.target.value))
                    }}
                    onBlur={save}
                />
            </PlayerAttribute>
            <PlayerAttribute>
                <label>image</label>
                <select
                    value={nameplate}
                    onChange={(e) => setNameplate(e.target.value)}
                    onBlur={save}
                >
                    <option value=""></option>
                    {nameplateOptions?.map((asset) => (
                        <option key={asset.url} value={asset.url}>
                            {asset.base}
                        </option>
                    ))}
                </select>
            </PlayerAttribute>
        </PlayerElement>
    )
}

export function PlayerDashboard() {
    const [playersRep, setPlayersRep] = useReplicant<Player[]>('players')
    const [playerElements, setPlayerElements] = useState<JSX.Element[]>([])

    useEffect(() => {
        if (!playersRep) {
            return
        }
        const elements: JSX.Element[] = []

        const onBlur = (p: Player) => {
            const copy = []
            if (playersRep && p.id > 0) {
                copy.push(...playersRep.slice(0, p.id))
            }

            copy.push(p)

            if (playersRep && p.id < playersRep.length - 1) {
                copy.push(...playersRep.slice(p.id + 1))
            }

            setPlayersRep(copy)
        }

        playersRep.forEach((player) => {
            elements.push(
                <PlayerDisplay player={player} saveChanges={onBlur} />
            )
        })

        setPlayerElements(elements)
    }, [playersRep])

    const addPlayer = useCallback(() => {
        if (!playersRep) {
            return
        }

        const maxId = playersRep.length
            ? playersRep[playersRep.length - 1].id
            : -1
        const player: Player = {
            id: maxId + 1,
            name: 'Player',
            points: 0,
        }

        setPlayersRep([...playersRep, player])
    }, [playersRep])

    const resetPoints = useCallback(() => {
        if (!playersRep) {
            return
        }

        const copy = playersRep.map((player) => {
            return {
                id: player.id,
                name: player.name,
                points: 0,
            }
        })

        setPlayersRep(copy)
    }, [playersRep])

    const [gameIdRep] = useReplicant<string>('gameId')
    const [gameId, setGameId] = useState<string | undefined>(gameIdRep || '')

    useEffect(() => {
        if (!gameIdRep) {
            return
        }

        setGameId(gameIdRep)
    }, [gameIdRep])

    const handleGameId = useCallback(() => {
        nodecg.sendMessage('setGameId', gameId)
    }, [gameId])

    return (
        <>
            <h2>Players</h2>
            <PlayerContainer>
                {...playerElements.map((e) => (
                    <>
                        {e}
                        <hr />
                    </>
                ))}
            </PlayerContainer>
            <button onClick={() => addPlayer()}>Add player</button>
            <button onClick={() => setPlayersRep([])}>Clear players</button>
            <br />
            <button onClick={() => resetPoints()}>Reset points</button>
            <br />
            <br />
            <label htmlFor="gameIdInput" style={{ marginRight: '1em' }}>
                JArchive Show Number (Rehearsals)
            </label>
            <input
                value={gameId}
                onChange={(e) => {
                    setGameId(e.target.value)
                }}
                onBlur={handleGameId}
                type="text"
                id="gameIdInput"
            />
        </>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<PlayerDashboard />)
