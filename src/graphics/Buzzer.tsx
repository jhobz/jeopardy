import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useGamepad } from '../utils/useGamepad';

export const Buzzer: React.FC = () => {
  const gamepads = useGamepad();
   
  console.log('gamepad', gamepads); 
  
  const aPresses = gamepads.map(pad => pad.connected ? pad.buttonA : false);

  console.log(aPresses);
  useEffect(() => {
    aPresses.forEach((value, index) => {
      if (value) nodecg.sendMessage('buzzerPressed', { index });
    })
  }, [aPresses.join('-')])
  
  return (
    <div>
      Buzzer system :V
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Buzzer />)


