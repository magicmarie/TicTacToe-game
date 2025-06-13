import { Container, Typography, Button, TextField } from "@mui/material";

export const LandingPage = () => {
  // const { username, setUsername, signIn } = useAuth();

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" align="center">Tic Tac Toe</Typography>
      <TextField
        fullWidth
        label="Enter username"
        // value={username}
        onChange={() => {}}
        sx={{ my: 2 }}
      />
      <Button
        fullWidth
        variant="contained"
        // onClick={signIn}
        // disabled={!username}
      >
        Enter Game
      </Button>
    </Container>
  );
};
