import { useState } from "react";
import { Grid, Typography, Button } from "@mui/material";
import { GameBoard } from "../components/GameBoard";
import { PlayerPanel } from "../components/PlayerPanel";

export const GamePage = () => {
  const player = "mariam";
  const player2 = "haddy"
  const [players, setPlayers] = useState<string[]>([player, player2]);
  const [useAI, setUseAI] = useState(true); // toggle to add AI
  const showBoard = players.length >= 2;

  return (
    <Grid container sx={{margin: "auto", display: "flex", width: "60%", justifyContent: "space-between", marginTop: "2rem"}}>
      {/* Game Board */}
      <Grid size={8} sx={{width: "50%" }}>
        {showBoard ? <GameBoard players={players} useAI={useAI} /> :
          <Typography align="center" sx={{ mt: 5 }}>
            Waiting for a second player...
          </Typography>
        }
      </Grid>

      {/* Player Panel */}
      <Grid size={4}>
        <PlayerPanel players={players} />
        {players.length < 2 && (
          <Button onClick={() => setPlayers([player, createAIPlayer()])}>
            Play with AI
          </Button>
        )}
      </Grid>
    </Grid>
  );
};
