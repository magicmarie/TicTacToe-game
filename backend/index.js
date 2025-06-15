const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { verifyCognitoToken } = require("./utils/auth");

const ddb = new AWS.DynamoDB.DocumentClient();
const ROOMS_TABLE = "GameRooms";
const CONNECTIONS_TABLE = "Connections";
const USERS_TABLE = "UserStats";

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event, null, 2));

  const { requestContext } = event;
  const routeKey = requestContext.routeKey;
  const connId = requestContext.connectionId;

  let token;
  let parsedBody = {};

  try {
    if (event.body) {
      parsedBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      token = parsedBody.token;
    }

    // Token fallback (only applies for $connect)
    if (!token && event.queryStringParameters) {
      token = event.queryStringParameters.token;
    }
  } catch (err) {
    console.error("❌ Failed to parse body or extract token:", err);
    return { statusCode: 400, body: "Bad request format" };
  }

  const user = await verifyCognitoToken(token);
  if (!user) {
    console.warn("⚠️ Token verification failed.");
    return { statusCode: 401, body: "Unauthorized" };
  }

  const userId = user.sub;
  console.log("✅ Authenticated userId:", userId);

  switch (routeKey) {
    case "$connect":
      try {
        await ddb.put({ TableName: CONNECTIONS_TABLE, Item: { connectionId: connId, userId } }).promise();
        console.log("✅ Connected user stored in DynamoDB");
        return { statusCode: 200 };
      } catch (error) {
        console.error("❌ DynamoDB error on $connect:", error);
        return { statusCode: 500, body: "Failed to connect" };
      }

    case "$disconnect":
      await ddb.delete({ TableName: CONNECTIONS_TABLE, Key: { connectionId: connId } }).promise();
      return { statusCode: 200 };

    case "joinRoom":
      return await joinRoom(userId, connId);

    case "makeMove":
      return await handleMove(parsedBody, userId);

    default:
      console.log("⚠️ Default route hit. Event:", JSON.stringify(event, null, 2));
      return { statusCode: 400, body: "Unknown action" };
  }
};

async function joinRoom(userId, connId) {
  // Find an existing room with one player
  const availableRooms = await ddb.scan({
    TableName: ROOMS_TABLE,
    FilterExpression: "size(players) = :size",
    ExpressionAttributeValues: {
      ":size": 1
    }
  }).promise();

  if (availableRooms.Items.length > 0) {
    // Join the first available room
    const room = availableRooms.Items[0];
    room.players.push({ userId, connId, symbol: "O" });
    await ddb.put({ TableName: ROOMS_TABLE, Item: room }).promise();
    return { statusCode: 200, body: JSON.stringify({ message: "Joined room as second player", roomId: room.roomId }) };
  } else {
    // Create a new room
    const roomId = uuidv4();
    const newRoom = {
      roomId,
      players: [{ userId, connId, symbol: "X" }],
      board: [["", "", ""], ["", "", ""], ["", "", ""]],
      currentTurn: "X"
    };
    await ddb.put({ TableName: ROOMS_TABLE, Item: newRoom }).promise();
    return { statusCode: 200, body: JSON.stringify({ message: "Created new room and joined as first player", roomId }) };
  }
}

function checkWinner(board) {
  const lines = [
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
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