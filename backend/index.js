const AWS = require("aws-sdk");
const { verifyCognitoToken } = require("./utils/auth");
 
const ddb = new AWS.DynamoDB.DocumentClient();
const ROOMS_TABLE = "GameRooms";
const CONNECTIONS_TABLE = "Connections";
const USERS_TABLE = "UserStats";
 
exports.handler = async (event) => {
  console.log("Incoming event:", event);
  const { requestContext, queryStringParameters } = event;
  const routeKey = requestContext.routeKey;
  const connId = requestContext.connectionId;
  const body = queryStringParameters;

  // ✅ Fix here: queryStringParameters is at top level
  const queryParams = event.queryStringParameters || {};
  const token = queryParams.token || (body && JSON.parse(body).token);

  const user = await verifyCognitoToken(token);
  if (!user) return { statusCode: 401, body: "Unauthorized" };

  const userId = user.sub;
  console.log("userId", userId);

  switch (routeKey) {
    case "$connect":
      try {
        await ddb.put({ TableName: CONNECTIONS_TABLE, Item: { connectionId: connId, userId } }).promise();
        console.log("Successfully wrote to DynamoDB");
        return { statusCode: 200 };
      } catch (error) {
        console.error("DynamoDB write failed:", error);
      }
      //await ddb.put({ TableName: CONNECTIONS_TABLE, Item: { connectionId: connId, userId } }).promise();
      //return { statusCode: 200 };

    case "$disconnect":
      await ddb.delete({ TableName: CONNECTIONS_TABLE, Key: { connectionId: connId } }).promise();
      return { statusCode: 200 };

    case "joinRoom":
      const parsedBody = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      return await joinRoom(parsedBody, userId, connId);

    case "makeMove":
      const parsedMakeMoveData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      return await handleMove(parsedMakeMoveData, userId);

    default:
      return { statusCode: 400, body: "Unknown action" };
  }
};
 
async function joinRoom(data, userId, connId) {
  const { roomId } = data;
  const roomData = await ddb.get({ TableName: ROOMS_TABLE, Key: { roomId } }).promise();
  const room = roomData.Item;

  if (!room) {
    const newRoom = {
      roomId,
      players: [{ userId, connId, symbol: "X" }],
      board: [["", "", ""], ["", "", ""], ["", "", ""]],
      currentTurn: "X"
    };
    await ddb.put({ TableName: ROOMS_TABLE, Item: newRoom }).promise();
    return { statusCode: 200, body: "Joined room as first player" };
  } else if (room.players.length === 1) {
    room.players.push({ userId, connId, symbol: "O" });
    await ddb.put({ TableName: ROOMS_TABLE, Item: room }).promise();
    return { statusCode: 200, body: "Joined room as second player" };
  } else {
    return { statusCode: 403, body: "Room full" };
  }
}
 
function checkWinner(board) {
  const lines = [
    // Rows
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // Columns
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // Diagonals
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]]
  ];
  for (const line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) return line[0];
  }
  return null;
}
 
async function handleMove(data, userId) {
  const { roomId, row, col } = data;
  const res = await ddb.get({ TableName: ROOMS_TABLE, Key: { roomId } }).promise();
  const room = res.Item;
  if (!room) return { statusCode: 404, body: "Room not found" };
 
  const player = room.players.find(p => p.userId === userId);
  if (!player || room.currentTurn !== player.symbol || room.board[row][col]) {
    return { statusCode: 400, body: "Invalid move" };
  }
 
  room.board[row][col] = player.symbol;
  const winner = checkWinner(room.board);
  const isDraw = room.board.flat().every(cell => cell);
 
  if (winner || isDraw) {
    await updateScores(room.players, winner);
    await ddb.delete({ TableName: ROOMS_TABLE, Key: { roomId } }).promise();
    return { statusCode: 200, body: JSON.stringify({ gameOver: true, winner: winner || "draw" }) };
  } else {
    room.currentTurn = room.currentTurn === "X" ? "O" : "X";
    await ddb.put({ TableName: ROOMS_TABLE, Item: room }).promise();
    return { statusCode: 200, body: JSON.stringify({ board: room.board, nextTurn: room.currentTurn }) };
  }
}
 
async function updateScores(players, winnerSymbol) {
  for (const player of players) {
    const res = await ddb.get({ TableName: USERS_TABLE, Key: { userId: player.userId } }).promise();
    const stats = res.Item || { userId: player.userId, gamesPlayed: 0, wins: 0, losses: 0, draws: 0 };
 
    stats.gamesPlayed += 1;
    if (!winnerSymbol || winnerSymbol === 'draw') {
      stats.draws += 1;
    } else if (player.symbol === winnerSymbol) {
      stats.wins += 1;
    } else {
      stats.losses += 1;
    }
 
    await ddb.put({ TableName: USERS_TABLE, Item: stats }).promise();
  }
}