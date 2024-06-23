import { useReplicant } from '@nodecg/react-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '../types/schemas';
import { useGamepad } from '../utils/useGamepad';

export const Buzzer: React.FC = () => {
  const gamepads = useGamepad();
  const [playersRep] = useReplicant<Player[]>('players')
  
  const aPresses = gamepads.map(pad => pad.connected ? pad.buttonA : false);

  console.log('a presses -', aPresses);
  useEffect(() => {
    aPresses.forEach((value, index) => {
      if (value) nodecg.sendMessage('buzzerPressed', { index });
    })
  }, [aPresses.join('-')])
  
  return (
    <div>
      {gamepads.map((gamepad, index) => (
        gamepad.connected && (<div key={index}>Controller {index + 1} ({gamepad.id}) - {playersRep?.find(x => x.controller === index)?.name ?? 'No player'}</div>)
      ))}
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Buzzer />)


