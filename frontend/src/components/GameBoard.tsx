import { Container, Grid, Paper, Typography, Box, Button } from '@mui/material';
import { sendMessage } from '../lib/websocket';
import { formatUsername } from '../pages/GamePage';

export type Player = 'X' | 'O';
export type Cell = Player | null;

type GameBoardProps = {
  mySymbol: Player | null;
  myName: string;
  opponentName: string;
  initialBoard: Cell[][] | null;
  currentTurn: Player | null;
  winner: boolean;
};

export const GameBoard = ({
  mySymbol,
  opponentName,
  initialBoard,
  currentTurn,
  winner,
}: GameBoardProps) => {
  const handleMove = (row: number, col: number) => {
    if (
      !initialBoard ||
      initialBoard[row][col] ||
      winner ||
      currentTurn !== mySymbol
    )
      return;

    // Send move via websocket
    sendMessage({
      action: 'makeMove',
      token: localStorage.getItem('token'),
      roomId: localStorage.getItem('roomId'),
      row,
      col,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
      <Typography variant="h6">You are {mySymbol}</Typography>
      <Typography variant="subtitle2">Opponent: {formatUsername(opponentName)}</Typography>
      <Box my={2}>
        {winner ? (
          <Typography>Game over</Typography>
        ) : (
          <Typography>{currentTurn}'s turn</Typography>
        )}
      </Box>

      <Grid container spacing={1} sx={{ width: '50%', margin: 'auto' }}>
        {initialBoard &&
          initialBoard.map((row, rowIndex) =>
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
