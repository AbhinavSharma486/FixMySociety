import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store.js';
import { Provider } from 'react-redux';
import { SocketContextProvider } from "./context/SocketContext.jsx";

createRoot(document.getElementById('root')).render(

  <Provider store={store}>
    <SocketContextProvider>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </SocketContextProvider>
  </Provider>
  ,
);
