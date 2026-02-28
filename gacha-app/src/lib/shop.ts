import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const tableName = process.env.DYNAMODB_USERS_TABLE;
const region = process.env.AWS_REGION;

let warnedMissingConfig = false;
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient() {
  if (!region || !tableName) {
    if (!warnedMissingConfig) {
      console.warn(
        "DynamoDB shop writes disabled: set AWS_REGION and DYNAMODB_USERS_TABLE.",
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

export class ShopError extends Error {
  constructor(
    public code: "DB_CONFIG_MISSING" | "USER_NOT_FOUND",
    message: string,
  ) {
    super(message);
  }
}

type UserRecord = {
  PK?: string;
  SK?: string;
  id?: string;
  userId?: string;
  sub?: string;
};

function isValidationException(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ValidationException"
  );
}

function isConditionalCheckFailed(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ConditionalCheckFailedException"
  );
}

async function findUserRecord(client: DynamoDBDocumentClient, userId: string) {
  if (!tableName) return null;

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

  return (scanResponse.Items?.[0] ?? null) as UserRecord | null;
}

function buildKeyCandidates(record: UserRecord) {
  const candidates: Record<string, string>[] = [];
  const seen = new Set<string>();

  const pushCandidate = (candidate: Record<string, string>) => {
    const key = JSON.stringify(candidate);
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  if (record.PK && record.SK) {
    pushCandidate({ PK: record.PK, SK: record.SK });
  }
  if (record.id) {
    pushCandidate({ id: record.id });
  }
  if (record.userId) {
    pushCandidate({ userId: record.userId });
  }
  if (record.sub) {
    pushCandidate({ sub: record.sub });
  }

  return candidates;
}

async function updateCoinsWithKey(
  client: DynamoDBDocumentClient,
  key: Record<string, string>,
  amount: number,
  nowIso: string,
) {
  if (!tableName) {
    throw new ShopError(
      "DB_CONFIG_MISSING",
      "Server storage is not configured for shop purchases.",
    );
  }

  const keyEntries = Object.keys(key);
  const conditionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};

  keyEntries.forEach((attributeName, index) => {
    const token = `#k${index}`;
    expressionAttributeNames[token] = attributeName;
    conditionParts.push(`attribute_exists(${token})`);
  });

  const response = await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression:
        "SET coins = if_not_exists(coins, :zero) + :amount, updatedAt = :updatedAt",
      ConditionExpression: conditionParts.join(" AND "),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ":zero": 0,
        ":amount": amount,
        ":updatedAt": nowIso,
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  return Number(response.Attributes?.coins ?? 0);
}

export async function addCoinsToUser(userId: string, amount: number) {
  const client = getDocClient();
  if (!client || !tableName) {
    throw new ShopError(
      "DB_CONFIG_MISSING",
      "Server storage is not configured for shop purchases.",
    );
  }

  const nowIso = new Date().toISOString();
  try {
    return await updateCoinsWithKey(
      client,
      {
        PK: `USER#${userId}`,
        SK: "PROFILE",
      },
      amount,
      nowIso,
    );
  } catch (error) {
    if (isConditionalCheckFailed(error)) {
      throw new ShopError("USER_NOT_FOUND", "User profile not found.");
    }

    if (!isValidationException(error)) {
      throw error;
    }
  }

  const fallbackRecord = await findUserRecord(client, userId);
  if (!fallbackRecord) {
    throw new ShopError("USER_NOT_FOUND", "User profile not found.");
  }

  const keyCandidates = buildKeyCandidates(fallbackRecord);
  if (keyCandidates.length === 0) {
    throw new ShopError("USER_NOT_FOUND", "User profile key is missing.");
  }

  let lastError: unknown = null;
  for (const keyCandidate of keyCandidates) {
    try {
      return await updateCoinsWithKey(client, keyCandidate, amount, nowIso);
    } catch (error) {
      if (isConditionalCheckFailed(error)) {
        throw new ShopError("USER_NOT_FOUND", "User profile not found.");
      }
      if (isValidationException(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new ShopError("USER_NOT_FOUND", "User profile not found.");
}
