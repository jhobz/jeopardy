import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from 'styled-components';
import { useReplicant, useListenFor } from "@nodecg/react-hooks"
import { createRoot } from "react-dom/client";
import { Player } from "../types/schemas";

const UPDATE_RATE_MS = 50;

function calculateTimeSinceStart(time: number) {
  return Date.now() - time;
}

function useTimeSince(startTime: number | undefined) {
  const [diff, setDiff] = useState(0);
  const ref = useRef<number | undefined>(startTime);

  useEffect(() => {
    ref.current = startTime;
  }, [startTime])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (ref.current === undefined || ref.current === -1) return;
      setDiff(calculateTimeSinceStart(ref.current));
    }, 0);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return diff;
}

export const TimerControls = () => {
  const [idleThreshold, setIdleThreshold] = useReplicant<number>('idleThreshold', { defaultValue: 5000 });
  const [answerThreshold, setAnswerThreshold] = useReplicant<number>('answerThreshold', { defaultValue: 5000 });
  const [idleStart, setIdleStart] = useReplicant<number>('idleStart', { defaultValue: -1 })
  const [answerStart, setAnswerStart] = useReplicant<number>('answerStart', { defaultValue: -1 })

  const idleTime = useTimeSince(idleStart);
  const answerTime = useTimeSince(answerStart);

  const handleStartIdle = useCallback(() => {
    if (idleStart === -1) {
      setIdleStart(Date.now());
    } else {
      setIdleStart(-1)
    }
  }, [idleStart, setIdleStart]);

  const handleStartAnswer = useCallback(() => {
    if (answerStart === -1) {
      setAnswerStart(Date.now());
    } else {
      setAnswerStart(-1);
    }
  }, [answerStart, setAnswerStart]);

  const handleIdleSound = useCallback(() => {
    nodecg.sendMessage('idleSound');
  }, []);

  const handleAnswerSound = useCallback(() => {
    nodecg.sendMessage('answerSound');
  }, []);

  useListenFor('startIdleTimer', () => {
    setIdleStart(Date.now());
  });

  useListenFor('clearIdleTimer', () => {
    setIdleStart(-1);
  });

  return (
    <Container>
      <ActiveLabel>
        <div>Idle&nbsp;</div>
        <FixedNumber isOver={idleTime > (idleThreshold || Number.MAX_VALUE)}>
          {(idleTime / 1000).toFixed(1)} s
        </FixedNumber>
      </ActiveLabel>
      <ActiveLabel>
        <div>Answer&nbsp;</div>
        <FixedNumber isOver={answerTime > (answerThreshold || Number.MAX_VALUE)}>
        {(answerTime / 1000).toFixed(1)} s
        </FixedNumber>
      </ActiveLabel>
      {/* <ActiveLabel>
        {activeBuzzer === null || activeBuzzer === undefined ? '-' : playersRep?.find(x => x.controller === activeBuzzer)?.name || 'No player set'}
      </ActiveLabel>
      <ActiveSublabel>{activeBuzzer === null || activeBuzzer === undefined ? '-' : `Controller ${activeBuzzer + 1}`}</ActiveSublabel> */}
      <ControlSection>
        <div>
          <button onClick={handleStartIdle}>{idleStart === -1 ? 'Start Idle' : 'Stop Idle'}</button>
          <button onClick={handleStartAnswer}>{answerStart === -1 ? 'Start Answer' : 'Stop Answer'}</button>
        </div>
      </ControlSection>
      <ControlSection>
        <div>
          <button onClick={handleIdleSound}>Play Idle Sound</button>
          <button onClick={handleAnswerSound}>Play Answer Timeout Sound</button>
        </div>
      </ControlSection>
      <ControlSection>
        <b>Thresholds</b>
        <div>
          <label htmlFor="idleThreshold">Idle (ms)</label>
          <input
            id="idleThreshold"
            type="number"
            value={idleThreshold || 0}
            onChange={e => setIdleThreshold(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="answerThreshold">Answer (ms)</label>
          <input
            id="answerThreshold"
            type="number"
            value={answerThreshold || 0}
            onChange={e => setAnswerThreshold(Number(e.target.value))}
          />
        </div>
      </ControlSection>
    </Container>
  )
};

const root = createRoot(document.getElementById('root')!)
root.render(<TimerControls />)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ActiveLabel = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ControlSection = styled.div`
  width: 100%;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #fff;

  & > b {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;

    & input {
      margin-left: 0.5rem;
    }
  }
`

const FixedNumber = styled.div<{ isOver: boolean }>`
  font-family: monospace;
  font-variant-numeric: tabular-nums;
  color: ${({ isOver }) => isOver && '#d36666'};
`;