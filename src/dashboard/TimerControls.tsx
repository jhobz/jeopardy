import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useReplicant, useListenFor } from '@nodecg/react-hooks'
import { createRoot } from 'react-dom/client'
import { Player } from '../types/schemas'

const UPDATE_RATE_MS = 50

function calculateTimeSinceStart(time: number) {
    return Date.now() - time
}

function useTimeSince(startTime: number | undefined) {
    const [diff, setDiff] = useState(0)
    const ref = useRef<number | undefined>(startTime)

    useEffect(() => {
        ref.current = startTime
    }, [startTime])

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (ref.current === undefined || ref.current === -1) return
            setDiff(calculateTimeSinceStart(ref.current))
        }, 0)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    return diff
}

export const TimerControls = () => {
    const [idleThreshold, setIdleThreshold] = useReplicant<number>(
        'idleThreshold',
        { defaultValue: 5000 }
    )
    const [answerThreshold, setAnswerThreshold] = useReplicant<number>(
        'answerThreshold',
        { defaultValue: 5000 }
    )
    const [idleStart, setIdleStart] = useReplicant<number>('idleStart', {
        defaultValue: -1,
    })
    const [answerStart, setAnswerStart] = useReplicant<number>('answerStart', {
        defaultValue: -1,
    })

    const idleTime = useTimeSince(idleStart)
    const answerTime = useTimeSince(answerStart)

    const handleStartIdle = useCallback(() => {
        if (idleStart === -1) {
            setIdleStart(Date.now())
        } else {
            setIdleStart(-1)
        }
    }, [idleStart, setIdleStart])

    const handleStartAnswer = useCallback(() => {
        if (answerStart === -1) {
            setAnswerStart(Date.now())
        } else {
            setAnswerStart(-1)
        }
    }, [answerStart, setAnswerStart])

    const handleTimeoutSound = useCallback(() => {
        nodecg.sendMessage('timeoutSound')
    }, [])

    const handleRoundOverSound = useCallback(() => {
        nodecg.sendMessage('roundOverSound')
    }, [])

    useListenFor('startIdleTimer', () => {
        setIdleStart(Date.now())
    })

    useListenFor('clearIdleTimer', () => {
        setIdleStart(-1)
    })

    useListenFor('startAnswerTimer', () => {
        setAnswerStart(Date.now())
    })

    useListenFor('clearAnswerTimer', () => {
        setAnswerStart(-1)
    })

    return (
        <Container>
            <ActiveLabel>
                <div>Idle&nbsp;</div>
                <FixedNumber
                    $isOver={idleTime > (idleThreshold || Number.MAX_VALUE)}
                >
                    {(idleTime / 1000).toFixed(1)} s
                </FixedNumber>
            </ActiveLabel>
            <ActiveLabel>
                <div>Answer&nbsp;</div>
                <FixedNumber
                    $isOver={answerTime > (answerThreshold || Number.MAX_VALUE)}
                >
                    {(answerTime / 1000).toFixed(1)} s
                </FixedNumber>
            </ActiveLabel>
            <ControlSection>
                <div>
                    <button onClick={handleStartIdle}>
                        {idleStart === -1 ? 'Start Idle' : 'Stop Idle'}
                    </button>
                    <button onClick={handleStartAnswer}>
                        {answerStart === -1 ? 'Start Answer' : 'Stop Answer'}
                    </button>
                </div>
            </ControlSection>
            <ControlSection>
                <div>
                    <button onClick={handleTimeoutSound}>
                        Play Timeout Sound
                    </button>
                    <button onClick={handleRoundOverSound}>
                        Play Round Over Sound
                    </button>
                </div>
            </ControlSection>
            <ControlSection>
                <h2>Warning Thresholds</h2>
                <div>
                    <label htmlFor="idleThreshold">Idle (ms)</label>
                    <input
                        id="idleThreshold"
                        type="number"
                        value={idleThreshold || 0}
                        onChange={(e) =>
                            setIdleThreshold(Number(e.target.value))
                        }
                    />
                </div>
                <div>
                    <label htmlFor="answerThreshold">Answer (ms)</label>
                    <input
                        id="answerThreshold"
                        type="number"
                        value={answerThreshold || 0}
                        onChange={(e) =>
                            setAnswerThreshold(Number(e.target.value))
                        }
                    />
                </div>
            </ControlSection>
        </Container>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<TimerControls />)

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ActiveLabel = styled.div`
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    margin-bottom: 0.4em;
`

const ControlSection = styled.div`
    width: 100%;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #fff;

    & > h2 {
        margin-bottom: 0.5em;
    }

    & > div {
        display: flex;
        justify-content: space-between;
        align-items: center;

        & input {
            margin-left: 0.5rem;
        }
    }
`

const FixedNumber = styled.div<{ $isOver: boolean }>`
    font-family: monospace;
    font-variant-numeric: tabular-nums;
    color: ${({ $isOver }) => $isOver && '#d36666'};
`
