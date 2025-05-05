import React from 'react';
import ReactDOM from 'react-dom/client'; // /clientを追加
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// rootを定義する
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
