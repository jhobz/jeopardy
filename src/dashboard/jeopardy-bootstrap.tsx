import React from 'react';
import { createRoot } from 'react-dom/client';
import { Jeopardy } from './Jeopardy';

const root = createRoot(document.getElementById('root')!);
root.render(<Jeopardy />);
