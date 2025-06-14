import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  Box,
  Button,
} from '@mui/material';

export type Cell = Player | null;
export type Player = 'X' | 'O';

interface GameBoardProps {
  mySymbol: Player;
  myName: string;
  opponentName: string;
}

export const GameBoard = ({ mySymbol, myName, opponentName }: GameBoardProps) => {
  const [board, setBoard] = useState<Cell[]>(
    () =>
      JSON.parse(
        localStorage.getItem('ttt-board') || '["","","","","","","","",""]'
      ) || Array(9).fill(null)
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>(
    (localStorage.getItem('ttt-player') as Player) || 'X'
  );
  const [winner, setWinner] = useState<Player | 'Draw' | null>(
    JSON.parse(localStorage.getItem('ttt-winner') || 'null')
  );

  useEffect(() => {
    const sync = () => {
      setBoard(
        JSON.parse(
          localStorage.getItem('ttt-board') || '["","","","","","","","",""]'
        ) || Array(9).fill(null)
      );
      setCurrentPlayer((localStorage.getItem('ttt-player') as Player) || 'X');
      setWinner(JSON.parse(localStorage.getItem('ttt-winner') || 'null'));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const handleMove = (i: number) => {
    if (board[i] || winner || currentPlayer !== mySymbol) return;
    const newBoard = [...board];
    newBoard[i] = currentPlayer;
    const result = checkWinner(newBoard);
    const next = currentPlayer === 'X' ? 'O' : 'X';

    setBoard(newBoard);
    setCurrentPlayer(next);
    setWinner(result);

    localStorage.setItem('ttt-board', JSON.stringify(newBoard));
    localStorage.setItem('ttt-player', next);
    localStorage.setItem('ttt-winner', JSON.stringify(result));
  };

  if (!mySymbol || !opponentName) {
    return (
      <Typography align="center" mt={5}>
        Welcome {myName}, you will play as {mySymbol || '...'}.
        <br />
        Waiting for the second player to join...
      </Typography>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="h6">
        Welcome {myName}, you are {mySymbol}
      </Typography>
      <Typography variant="subtitle2">Your opponent: {opponentName}</Typography>
      <Box mb={2}>
        {winner === null ? (
          <Typography variant="h6">It's {currentPlayer}'s turn</Typography>
        ) : (
          <Alert severity="success">
            {winner === 'Draw'
              ? "It's a draw!"
              : `Congratulations ${winner}, you won!`}
          </Alert>
        )}
      </Box>

      <Grid container spacing={1} sx={{ width: '50%', margin: 'auto'}}>
        {board.map((cell, i) => (
          <Grid size={4} key={i} >
            <Paper
              elevation={3}
              onClick={() => handleMove(i)}
              sx={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor:
                  cell || winner || currentPlayer !== mySymbol
                    ? 'not-allowed'
                    : 'pointer',
                backgroundColor: cell ? 'primary.light' : 'grey.100',
              }}
            >
              {cell}
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="outlined"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        sx={{ mt: 3 }}
      >
        Reset Game
      </Button>
    </Container>
  );
};

// Include or import this function
function checkWinner(board: Cell[]): Player | 'Draw' | null {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return board.every(Boolean) ? 'Draw' : null;
}
