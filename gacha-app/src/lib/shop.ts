import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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

export async function addCoinsToUser(userId: string, amount: number) {
  const client = getDocClient();
  if (!client || !tableName) {
    throw new ShopError(
      "DB_CONFIG_MISSING",
      "Server storage is not configured for shop purchases.",
    );
  }

  const nowIso = new Date().toISOString();
  const response = await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: "PROFILE",
      },
      UpdateExpression:
        "SET coins = if_not_exists(coins, :zero) + :amount, updatedAt = :updatedAt",
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
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
