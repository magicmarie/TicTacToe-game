import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppHeader from "./components/AppBar";
import { GamePage } from "./pages/GamePage";
import { AuthForm } from './components/AuthForm';
import PrivateRoute from './hooks/privateRoute';

export default function App() {
  return (
    <Router>
      <AppHeader />
      <Routes>
        <Route
          path="/board"
          element={
            <PrivateRoute>
              <GamePage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<AuthForm />} />
      </Routes>
    </Router>
  );
}
