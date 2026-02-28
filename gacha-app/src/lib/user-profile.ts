import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { requireAuthenticatedUser } from "@/lib/server-auth";

type UserProfileRecord = {
  username?: string;
  displayName?: string;
  coins?: number;
};

const tableName = process.env.DYNAMODB_USERS_TABLE;
const region = process.env.AWS_REGION;

let warnedMissingConfig = false;
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient() {
  if (!region || !tableName) {
    if (!warnedMissingConfig) {
      console.warn(
        "DynamoDB profile reads disabled: set AWS_REGION and DYNAMODB_USERS_TABLE.",
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  if (docClient) {
    return docClient;
  }

  const client = new DynamoDBClient({ region });
  docClient = DynamoDBDocumentClient.from(client);
  return docClient;
}

async function getUserProfileById(userId: string | undefined) {
  if (!userId) {
    return null;
  }

  const client = getDocClient();
  if (!client || !tableName) {
    return null;
  }

  try {
    const response = await client.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: "PROFILE",
        },
        ConsistentRead: true,
      }),
    );

    return (response.Item ?? null) as UserProfileRecord | null;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ValidationException"
    ) {
      const scanResponse = await client.send(
        new ScanCommand({
          TableName: tableName,
          FilterExpression: "userId = :userId OR #sub = :userId OR id = :userId",
          ExpressionAttributeNames: {
            "#sub": "sub",
          },
          ExpressionAttributeValues: {
            ":userId": userId,
          },
          Limit: 1,
        }),
      );

      return (scanResponse.Items?.[0] ?? null) as UserProfileRecord | null;
    }

    throw error;
  }
}

export async function getTopNavProfile(returnToPath: string) {
  const user = await requireAuthenticatedUser(returnToPath);
  const profile = await getUserProfileById(user.sub);

  const rawUsername =
    profile?.username ??
    profile?.displayName ??
    user.nickname ??
    user.name ??
    user.email?.split("@")[0] ??
    "New Recruit";
  const username = rawUsername.includes("@")
    ? rawUsername.split("@")[0] || "New Recruit"
    : rawUsername;

  const coins = Number(profile?.coins ?? 0);

  return {
    username,
    coins: Number.isFinite(coins) ? coins : 0,
  };
}
