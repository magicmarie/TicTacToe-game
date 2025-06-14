import { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Typography,
  Button,
  Box,
  Paper,
  Container,
  Alert,
} from '@mui/material';
import { GameBoard } from '../components/GameBoard';

import { LandingPage } from './LandingPage';
import { getTabId } from '../services/tab';

export type Player = 'X' | 'O';

type PlayerData = {
  id: number;
  name: string;
  symbol: Player;
  tabId: string;
};

type StoredPlayer = {
  id: number;
  name: string;
  symbol: Player;
  tabId: string;
};

export const GamePage = () => {
  const [players, setPlayers] = useState<
    Record<Player, PlayerData | undefined>
  >({
    X: undefined,
    O: undefined,
  });
  const [mySymbol, setMySymbol] = useState<Player | null>(null);
  const [myName, setMyName] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  const tabId = getTabId();

  // Inside GamePage component:
  const opponentName =
    mySymbol === 'X'
      ? players.O?.name || ''
      : mySymbol === 'O'
      ? players.X?.name || ''
      : '';

  useEffect(() => {
    const loadPlayers = () => {
      let savedPlayers: StoredPlayer[] = [];
      try {
        const rawData = localStorage.getItem('ttt-players');
        if (rawData) {
          const parsed = JSON.parse(rawData);
          if (Array.isArray(parsed)) {
            savedPlayers = parsed;
          } else {
            console.warn('Invalid ttt-players data: not an array', parsed);
            localStorage.setItem('ttt-players', JSON.stringify([]));
          }
        }
        console.log('Saved Players:', savedPlayers);
      } catch (error) {
        console.error('Failed to parse ttt-players:', error);
        localStorage.setItem('ttt-players', JSON.stringify([]));
      }

      const playersMap: Record<Player, PlayerData | undefined> = {
        X: savedPlayers.find((p) => p.symbol === 'X'),
        O: savedPlayers.find((p) => p.symbol === 'O'),
      };
      setPlayers(playersMap);

      const myPlayer = savedPlayers.find((p) => p.tabId === tabId);
      if (myPlayer) {
        setMySymbol(myPlayer.symbol);
        setMyName(myPlayer.name);
      } else {
        setMySymbol(null);
        setMyName(null);
      }
    };

    loadPlayers();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ttt-players') {
        loadPlayers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tabId]);

  const onJoin = (name: string) => {
    let playersData: StoredPlayer[] = [];
    try {
      const rawData = localStorage.getItem('ttt-players');
      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (Array.isArray(parsed)) {
          playersData = parsed;
        } else {
          console.warn(
            'Invalid ttt-players data in onJoin: not an array',
            parsed
          );
          localStorage.setItem('ttt-players', JSON.stringify([]));
        }
      }
    } catch (error) {
      console.error('Failed to parse ttt-players in onJoin:', error);
      localStorage.setItem('ttt-players', JSON.stringify([]));
    }

    if (
      playersData.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() && p.tabId !== tabId
      )
    ) {
      alert('Username already taken');
      return;
    }

    const existingPlayerIndex = playersData.findIndex((p) => p.tabId === tabId);
    const updatedPlayers = [...playersData];

    if (existingPlayerIndex !== -1) {
      updatedPlayers[existingPlayerIndex] = {
        ...updatedPlayers[existingPlayerIndex],
        name,
      };
    } else if (playersData.length < 2) {
      const id = playersData.length + 1;
      const symbol: Player = id === 1 ? 'X' : 'O';
      updatedPlayers.push({ id, name, symbol, tabId });
    } else {
      alert('Game already has 2 players!');
      return;
    }

    localStorage.setItem('ttt-players', JSON.stringify(updatedPlayers));
    const myPlayer = updatedPlayers.find((p) => p.tabId === tabId);
    if (myPlayer) {
      setPlayers({
        X: updatedPlayers.find((p) => p.symbol === 'X'),
        O: updatedPlayers.find((p) => p.symbol === 'O'),
      });
      setMySymbol(myPlayer.symbol);
      setMyName(myPlayer.name);
      setForceUpdate((prev) => prev + 1);
    }
    console.log('Updated Players State:', players);
  };

  const playerCount = useMemo(
    () => [players.X, players.O].filter((p) => p !== undefined).length,
    [players, forceUpdate]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LandingPage
        onJoin={onJoin}
        takenSymbols={{
          X:
            players.X?.tabId !== tabId && players.X?.name ? players.X.name : '',
          O:
            players.O?.tabId !== tabId && players.O?.name ? players.O.name : '',
        }}
      />

      {mySymbol && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome {myName}, you are player <strong>{mySymbol}</strong>
        </Alert>
      )}

      <Box
        sx={{
          borderTop: '1px solid gray',
          pt: 4,
          display: 'flex',
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {playerCount === 2 && mySymbol && myName && opponentName ? (
          <GameBoard
            mySymbol={mySymbol}
            myName={myName}
            opponentName={opponentName}
          />
        ) : playerCount === 1 ? (
          <Typography align="center" sx={{ mt: 5 }}>
            Waiting for a second player...
          </Typography>
        ) : (
          <Typography align="center" sx={{ mt: 5 }}>
            Enter a username to start the game
          </Typography>
        )}

        <Grid size={12} sx={{ width: '8rem'}}>
          <Paper sx={{ p: 1 }}>
            <Typography variant="subtitle1">Players:</Typography>
            <Typography>X: {players.X?.name || '---'}</Typography>
            <Typography>O: {players.O?.name || '---'}</Typography>
          </Paper>

          {playerCount === 1 && (
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => alert('AI play not implemented yet')}
            >
              Play with AI
            </Button>
          )}
        </Grid>
      </Box>
    </Container>
  );
};
