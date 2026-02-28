import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { requireAuthenticatedUser } from "@/lib/server-auth";

type UserProfileRecord = {
  PK?: string;
  SK?: string;
  userId?: string;
  sub?: string;
  id?: string;
  username?: string;
  displayName?: string;
  coins?: number;
  ownedCardIds?: string[] | Set<string>;
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

  const lookupByScan = async () => {
    const scanResponse = await client.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression:
          "(userId = :userId OR #sub = :userId OR id = :userId OR PK = :pk) AND (attribute_not_exists(SK) OR SK = :profileSk OR begins_with(SK, :profilePrefix))",
        ExpressionAttributeNames: {
          "#sub": "sub",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":pk": `USER#${userId}`,
          ":profileSk": "PROFILE",
          ":profilePrefix": "PROFILE",
        },
        Limit: 25,
      }),
    );

    const items = (scanResponse.Items ?? []) as UserProfileRecord[];
    if (items.length === 0) {
      return null;
    }

    const exactProfile = items.find((item) => item.SK === "PROFILE");
    if (exactProfile) {
      return exactProfile;
    }

    const profileLike = items.find(
      (item) =>
        typeof item.SK === "string" && item.SK.toUpperCase().startsWith("PROFILE"),
    );
    if (profileLike) {
      return profileLike;
    }

    return items[0] ?? null;
  };

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

    if (response.Item) {
      return response.Item as UserProfileRecord;
    }

    return await lookupByScan();
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ValidationException"
    ) {
      return await lookupByScan();
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
  const ownedCardIdsRaw = profile?.ownedCardIds;
  const ownedCardIds =
    ownedCardIdsRaw instanceof Set
      ? [...ownedCardIdsRaw].map(String)
      : Array.isArray(ownedCardIdsRaw)
        ? ownedCardIdsRaw.map(String)
        : [];
  const normalizedOwnedCardIds = ownedCardIds.filter((cardId) => cardId.length > 0);

  return {
    username,
    coins: Number.isFinite(coins) ? coins : 0,
    ownedCardIds: normalizedOwnedCardIds,
  };
}
