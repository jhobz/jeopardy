import React from 'react';
import { createRoot } from 'react-dom/client';
import { Board } from './Board';

const root = createRoot(document.getElementById('root')!);
root.render(<Board />);
