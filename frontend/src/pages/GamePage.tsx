// src/pages/GamePage.tsx
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  Box,
  Grid,
  Paper,
  Button,
  Snackbar,
} from '@mui/material';
import { GameBoard } from '../components/GameBoard';
import { useWebSocket } from '../context/useWebSocket';
import { addGamePageListener } from '../lib/websocket';

export type Player = 'X' | 'O';

type PlayerData = {
  name: string;
  symbol: Player;
};

const GamePage: React.FC = () => {
  const [opponentName, setOpponentName] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [error, setError] = useState('');
  const [gameBoardKey, setGameBoardKey] = useState(0);
  const [winnerMsg, setWinnerMsg] = useState('');

  const [joinedRoom, setJoinedRoom] = useState(() => {
    const saved = localStorage.getItem('joinedRoom');
    return saved === 'true';
  });

  const [roomId, setRoomId] = useState(
    () => localStorage.getItem('roomId') || ''
  );
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('players');
    return saved ? JSON.parse(saved) : { X: null, O: null };
  });
  const [mySymbol, setMySymbol] = useState(
    () => localStorage.getItem('mySymbol') || ''
  );
  const [myName, setMyName] = useState(
    () => localStorage.getItem('myName') || ''
  );
  const [board, setBoard] = useState(() => {
    const saved = localStorage.getItem('board');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentTurn, setCurrentTurn] = useState(() =>
    localStorage.getItem('currentTurn')
  );

  const { sendMessage } = useWebSocket();

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  const userID = localStorage.getItem('userId');

  useEffect(() => {
    const savedJoinedRoom = localStorage.getItem('joinedRoom');
    if (savedJoinedRoom === 'true') {
      setJoinedRoom(true);
    }

    const savedRoomId = localStorage.getItem('roomId');
    if (savedRoomId) setRoomId(savedRoomId);

    const savedPlayers = localStorage.getItem('players');
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));

    const savedSymbol = localStorage.getItem('mySymbol');
    if (savedSymbol === 'X' || savedSymbol === 'O') setMySymbol(savedSymbol);

    const savedName = localStorage.getItem('myName');
    if (savedName) setMyName(savedName);

    const savedBoard = localStorage.getItem('board');
    if (savedBoard) setBoard(JSON.parse(savedBoard));

    const savedTurn = localStorage.getItem('currentTurn');
    if (savedTurn === 'X' || savedTurn === 'O') setCurrentTurn(savedTurn);
  }, []);

  useEffect(() => {
    // Only save if joinedRoom is true (game started)
    if (joinedRoom) {
      localStorage.setItem('joinedRoom', 'true');
    } else {
      localStorage.removeItem('joinedRoom');
    }

    if (roomId) {
      localStorage.setItem('roomId', roomId);
    } else {
      localStorage.removeItem('roomId');
    }

    // Save players only if both players are not null or at least one player exists
    if (players && (players.X !== null || players.O !== null)) {
      localStorage.setItem('players', JSON.stringify(players));
    }

    if (mySymbol) {
      localStorage.setItem('mySymbol', mySymbol);
    } else {
      localStorage.removeItem('mySymbol');
    }

    if (myName) {
      localStorage.setItem('myName', myName);
    } else {
      localStorage.removeItem('myName');
    }

    if (board) {
      localStorage.setItem('board', JSON.stringify(board));
    }

    if (currentTurn) {
      localStorage.setItem('currentTurn', currentTurn);
    }
  }, [joinedRoom, roomId, players, mySymbol, myName, board, currentTurn]);

  useEffect(() => {
    if (!token || !email) {
      setError('Missing user token or email');
      return;
    }

    setMyName(email);

    const handleMessage = (data: any) => {
      console.log('WebSocket message received in GamePage:', data);
      localStorage.setItem('data', JSON.stringify(data));

      if (data.message?.includes('roomUpdate')) {
        setJoinedRoom(true);
        setRoomId(data.room?.roomId || null);
        localStorage.setItem('roomId', data.room?.roomId || '');

        if (data.room?.board) setBoard(data.room.board);
        if (data.room?.currentTurn) setCurrentTurn(data.room.currentTurn);

        const map: Record<Player, PlayerData | null> = { X: null, O: null };
        data.room?.players?.forEach((p: any) => {
          map[p.symbol as Player] = {
            name: p.userId,
            symbol: p.symbol,
          };
        });
        console.log(map, 'MAP____');
        console.log(data.room.players, '----DDDDD');
        setPlayers(map);
        const me = data.room.players.find(
          (p: any) => p.userId === userID || p.userEmail === email
        );
        console.log(me, 'me-----');
        if (me) setMySymbol(me.symbol);

        // Also set opponent name
        const opp = me?.symbol === 'X' ? map.O : map.X;
        setOpponentName(opp?.name || '');

        setInfoMsg(data.message || '');
        return;
      }

      if (data.type === 'moveUpdate') {
        if (data.board) {
          setBoard(data.board);
          localStorage.setItem('board', JSON.stringify(data.board));
        }

        if (data.nextTurn) {
          setCurrentTurn(data.currentTurn);
          localStorage.setItem('currentTurn', data.currentTurn);
        }

        if (data.gameOver) {
          setWinnerMsg(data.winner === 'draw' ? 'Game is a draw!' : `${data.winner} wins!`)
          setGameBoardKey((k) => k + 1);
        }
      }

      if (data.type === 'playerUpdate') {
        const map: Record<Player, PlayerData | null> = { X: null, O: null };
        data.players.forEach((p: any) => {
          map[p.symbol as Player] = {
            name: p.userEmail,
            symbol: p.symbol,
          };
        });
        setPlayers(map);
        const opp = mySymbol === 'X' ? map.O : map.X;
        setOpponentName(opp?.name || '');
      }

      if (data.type === 'gameOver') {
        alert(
          data.winner === 'draw' ? 'Game is a draw!' : `${data.winner} wins!`
        );
        setGameBoardKey((k) => k + 1);
      }
    };

    addGamePageListener(handleMessage);
  }, []);

  const handleJoinRoom = () => {
    if (!token) return;
    console.log('working--');
    sendMessage({ action: 'joinRoom', token });
  };

  const bothPlayersJoined = players.X && players.O && mySymbol;
  console.log(players, 'pppp---', mySymbol);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {infoMsg && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            {infoMsg}
          </Alert>
          <Alert severity="success" sx={{ mb: 2 }}>{winnerMsg}</Alert>
          <Snackbar
            open={!!infoMsg}
            autoHideDuration={3000}
            onClose={() => setInfoMsg('')}
            message={infoMsg}
          />
        </>
      )}
      {!joinedRoom ? (
        <Box textAlign="center" mt={5}>
          <Button
            variant="contained"
            size="large"
            disabled={joinedRoom}
            onClick={handleJoinRoom}
          >
            Join Game Room
          </Button>
        </Box>
      ) : (
        <>
          {mySymbol && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Welcome {myName}, you are player <strong>{mySymbol}</strong>
              {roomId && (
                <span style={{ display: 'block' }}>
                  Room ID: <code>{roomId}</code>
                </span>
              )}
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
            <Box flex={1}>
              {/* {bothPlayersJoined && board ? ( */}
              <GameBoard
                key={gameBoardKey}
                mySymbol={mySymbol}
                myName={myName}
                opponentName={opponentName}
                initialBoard={board}
                currentTurn={currentTurn}
              />
              {/* // ) : (
              //   <Typography align="center" sx={{ mt: 5 }}>
              //     Waiting for a second player to join...
              //   </Typography>
              // )} */}
            </Box>
            <Grid size={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Players:
                </Typography>
                <Typography>X: {players.X?.name || '---'}</Typography>
                <Typography>O: {players.O?.name || '---'}</Typography>
                {currentTurn && (
                  <Typography sx={{ mt: 1 }}>
                    <strong>Current Turn:</strong> {currentTurn}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
};

export { GamePage };
