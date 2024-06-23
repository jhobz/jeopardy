import { useReplicant } from '@nodecg/react-hooks';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Player } from '../types/schemas';

export const Nameplate: React.FC = () => {
  const [playersRep] = useReplicant<Player[]>('players')
  const index = new URLSearchParams(window.location.search).get('index');

  if (!index) return <div>No index query parameter specified.</div>;

  const player = playersRep?.find(x => x.id === Number(index));

  if (!player) return null;
  
  return (
    <div>
      <img src={player.nameplateImage} />
      <div>{player.points}</div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Nameplate />)


