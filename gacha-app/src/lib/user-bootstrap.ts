import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

type Auth0User = {
  sub?: string;
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
};

const tableName = process.env.DYNAMODB_USERS_TABLE;
const region = process.env.AWS_REGION;

let warnedMissingConfig = false;
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient() {
  if (!region || !tableName) {
    if (!warnedMissingConfig) {
      console.warn(
        "DynamoDB bootstrap disabled: set AWS_REGION and DYNAMODB_USERS_TABLE.",
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

export async function bootstrapUserRecord(user: Auth0User | undefined) {
  if (!user?.sub) {
    return;
  }

  const client = getDocClient();
  if (!client || !tableName) {
    return;
  }

  const nowIso = new Date().toISOString();

  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          PK: `USER#${user.sub}`,
          SK: "PROFILE",
          userId: user.sub,
          email: user.email ?? null,
          username: user.nickname ?? user.name ?? "New Recruit",
          displayName: user.name ?? user.nickname ?? "New Recruit",
          picture: user.picture ?? null,
          coins: 1000,
          ownedCardIds: new Set([""]),
          createdAt: nowIso,
        },
        ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      }),
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      return;
    }

    throw error;
  }
}
