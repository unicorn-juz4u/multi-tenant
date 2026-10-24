import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch } from './app/hooks.js';
import { bootstrapAuth } from './features/auth/authThunks.js';
import AppRoutes from './routes/AppRoutes.jsx';

export const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Run silent auth bootstrap once on initial app load
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
