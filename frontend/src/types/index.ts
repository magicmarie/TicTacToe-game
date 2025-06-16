export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];

export interface WebSocketMessage  {
  message?: string;
  type?: string;
  room?: {
    roomId: string;
    board: unknown;
    currentTurn?: Player;
    players?: Array<{
      userId: string;
      email?: string;
      symbol: Player;
    }>;
  };
  players?: Array<{
    userId: string;
    userEmail?: string;
    symbol: Player;
  }>;
  board?: unknown;
  currentTurn?: Player;
  gameOver?: boolean;
  winner?: string;
};