import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import HiveEngineToolsV2 from './HiveEngineToolsV2';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <HiveEngineToolsV2 />
  </React.StrictMode>
);