import { useState } from "react";
import { Grid, Paper } from "@mui/material";

export const GameBoard = ({ players, useAI }: { players: String[], useAI: boolean }) => {
  const [board, setBoard] = useState<string[][]>(Array(3).fill(Array(3).fill('')));
  const [currentPlayer, setCurrentPlayer] = useState(0);

  const handleCellClick = (row: number, col: number) => {
    // if (board[row][col]) return;
    // const updated = board.map((r, i) =>
    //   r.map((c, j) => (i === row && j === col ? players[currentPlayer].symbol : c))
    // );
    // setBoard(updated);
    // setCurrentPlayer((currentPlayer + 1) % players.length);

    // // if AI is next, trigger AI move
    // if (useAI && players[(currentPlayer + 1) % 2].isAI) {
    //   setTimeout(() => {
    //     const aiMove = computeAIMove(updated);
    //     if (aiMove) handleCellClick(aiMove.row, aiMove.col);
    //   }, 500);
    // }
  };

  return (
    <Grid container spacing={1}>
      {board.map((row, i) => (
        <Grid container size={12} spacing={1} key={i}>
          {row.map((cell, j) => (
            <Grid size={4} key={j}>
              <Paper
                onClick={() => handleCellClick(i, j)}
                sx={{
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  cursor: 'pointer',
                }}
              >
                {cell}
              </Paper>
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  );
};
