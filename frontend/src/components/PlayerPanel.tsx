import { Box, Typography } from "@mui/material";

interface PlayerPanelProps {
  players: string[],
}

export const PlayerPanel = (props: PlayerPanelProps) => {
  const { players } = props;
  return (
    <Box>
      <Typography>Players</Typography>
      {players.map(player =>
        <Typography key={player}>{player}</Typography>
      )}
    </Box>
  );

}
