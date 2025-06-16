import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  Box,
  Button,
} from '@mui/material';
import { sendMessage } from '../lib/websocket';

export type Player = 'X' | 'O';
export type Cell = Player | null;

type GameBoardProps = {
  mySymbol: Player | null;
  myName: string;
  opponentName: string;
  initialBoard: string[][] | null; 
  currentTurn: Player | null;
};

export const GameBoard = ({
  mySymbol,
  myName,
  opponentName,
  initialBoard,
  currentTurn,
}: GameBoardProps) => {
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);

  // Check winner helper (implement your own)
  const checkWinner = (board: Cell[][]): Player | 'Draw' | null => {
    // Your check logic here...
    // Return 'X', 'O', 'Draw' or null
    return null;
  };

  const handleMove = (row: number, col: number) => {
    if (initialBoard[row][col] || winner || currentTurn !== mySymbol) return;

    // Send move via websocket
    sendMessage({
      action: 'makeMove',
      token: localStorage.getItem('token'),
      roomId: localStorage.getItem('roomId'),
      row,
      col,
    });
  };

  useEffect(() => {
    const result = checkWinner(initialBoard);
    if (result) setWinner(result);
  }, [initialBoard]);

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
      <Typography variant="h6">You are {mySymbol}</Typography>
      <Typography variant="subtitle2">Opponent: {opponentName}</Typography>
      <Box my={2}>
        {winner ? (
          <Alert severity="success">
            {winner === 'Draw' ? "It's a draw!" : `${winner} wins!`}
          </Alert>
        ) : (
          <Typography>{currentTurn}'s turn</Typography>
        )}
      </Box>

      <Grid container spacing={1} sx={{ width: '50%', margin: 'auto' }}>
        {initialBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Grid size={4} key={`${rowIndex}-${colIndex}`}>
              <Paper
                elevation={3}
                onClick={() => handleMove(rowIndex, colIndex)}
                sx={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  cursor:
                    cell || winner || currentTurn !== mySymbol
                      ? 'not-allowed'
                      : 'pointer',
                  backgroundColor: cell ? 'primary.light' : 'grey.100',
                  userSelect: 'none',
                }}
              >
                {cell}
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
        Restart
      </Button>
    </Container>
  );
};

