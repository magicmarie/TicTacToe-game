import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  Box,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import { GameBoard } from '../components/GameBoard';
import { connectSocket, closeSocket } from '../lib/websocket';

export type Player = 'X' | 'O';

type PlayerData = {
  name: string;
  symbol: Player;
};

const ROOM_ID = 'room-123';

export const GamePage = () => {
  const [players, setPlayers] = useState<Record<Player, PlayerData | null>>({
    X: null,
    O: null,
  });
  const [myName, setMyName] = useState('');
  const [mySymbol, setMySymbol] = useState<Player | null>(null);
  const [opponentName, setOpponentName] = useState('');

  useEffect(() => {
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    // if (!user || !user.username) {
    //   console.error('No user in localStorage');
    //   return;
    // }

    // setMyName(user.username);

    connectSocket(ROOM_ID, (data: any) => {
      switch (data.type) {
        case 'roomJoined':
          console.log(`Joined room: ${ROOM_ID}`);
          setMySymbol(data.symbol); // Assigned by server
          break;

        case 'playerUpdate':
          const playerMap: Record<Player, PlayerData | null> = {
            X: null,
            O: null,
          };
          data.players.forEach((p: any) => {
            playerMap[p.symbol as Player] = { name: p.name, symbol: p.symbol };
          });
          setPlayers(playerMap);

          // Set opponent name
          if (mySymbol) {
            const opp = mySymbol === 'X' ? playerMap.O : playerMap.X;
            setOpponentName(opp?.name || '');
          }
          break;

        case 'moveMade':
          // Optionally: broadcast move to GameBoard via props/callback/state
          break;

        default:
          console.warn('Unknown message type:', data);
      }
    });

    return () => {
      closeSocket();
    };
  }, [mySymbol]);

  const bothPlayersJoined = players.X && players.O && mySymbol;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {mySymbol && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Welcome {myName}, you are player <strong>{mySymbol}</strong>
        </Alert>
      )}

      <Box
        sx={{
          pt: 4,
          display: 'flex',
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {bothPlayersJoined ? (
          <GameBoard
            mySymbol={mySymbol}
            myName={myName}
            opponentName={opponentName}
          />
        ) : (
          <Typography align="center" sx={{ mt: 5 }}>
            Waiting for a second player to join...
          </Typography>
        )}

        <Grid size={12} sx={{ width: '8rem' }}>
          <Paper sx={{ p: 1 }}>
            <Typography variant="subtitle1">Players:</Typography>
            <Typography>X: {players.X?.name || '---'}</Typography>
            <Typography>O: {players.O?.name || '---'}</Typography>
          </Paper>

          {!players.O && (
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => alert('AI play not implemented')}
            >
              Play with AI
            </Button>
          )}
        </Grid>
      </Box>
    </Container>
  );
};
