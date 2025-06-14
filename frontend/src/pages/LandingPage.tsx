import { Container, Typography, Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { getTabId } from '../services/tab';
import { type Player } from './GamePage';

export type LandingPageProps = {
  onJoin: (username: string) => void;
  takenSymbols: {
    X: string;
    O: string;
  };
};

export const LandingPage = ({ onJoin, takenSymbols }: LandingPageProps) => {
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [renderKey, setRenderKey] = useState(Date.now());
  const tabId = getTabId();

  console.log(
    'Render - Username:',
    username,
    'isJoining:',
    isJoining,
    'joinSuccess:',
    joinSuccess
  ); // Debug log

  const isNameTaken = Object.values(takenSymbols)
    .filter(
      (n) =>
        n.trim() !== '' && !n.toLowerCase().includes(username.toLowerCase())
    )
    .map((n) => n.toLowerCase())
    .includes(username.trim().toLowerCase());

  const isButtonDisabled = !username.trim() || isNameTaken;

  const handleJoin = () => {
    setIsJoining(true);
    const playersData: {
      id: number;
      name: string;
      symbol: Player;
      tabId: string;
    }[] = JSON.parse(localStorage.getItem('ttt-players') || '[]');

    if (
      playersData.length >= 2 &&
      !playersData.some((p) => p.tabId === tabId)
    ) {
      alert('Game already has 2 players!');
      setIsJoining(false);
      return;
    }

    onJoin(username);
    setIsJoining(false);
    setJoinSuccess(true); // Mark join as successful
    setRenderKey(Date.now()); // Refresh key after join
  };

  useEffect(() => {
    // Reset username only after successful join
    if (joinSuccess && !isJoining && !isButtonDisabled && username.trim()) {
      console.log(
        'Resetting username after join:',
        username,
        'joinSuccess:',
        joinSuccess
      );
      setUsername('');
      setJoinSuccess(false); // Reset success flag
    }
  }, [joinSuccess, isJoining, isButtonDisabled, username]);

  return (
    <Container maxWidth="sm" sx={{ mb: 4 }}>
      <Typography variant="h3" align="center">
        Tic Tac Toe
      </Typography>
      <TextField
        key={renderKey}
        fullWidth
        label="Enter username"
        value={username}
        onChange={(e) => {
          const newValue = e.target.value;
          setUsername(newValue);
        }}
        sx={{ my: 2 }}
        error={isNameTaken && username.trim() !== '' && !isJoining}
        helperText={
          isNameTaken && username.trim() !== '' && !isJoining
            ? 'Username already taken'
            : ''
        }
      />
      <Button
        fullWidth
        variant="contained"
        onClick={handleJoin}
        disabled={isButtonDisabled}
      >
        Enter Game
      </Button>
    </Container>
  );
};
