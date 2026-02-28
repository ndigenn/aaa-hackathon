import cardsData from "@/app/cards.json";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

export const SINGLE_SUMMON_COST = 1000;

export type BannerId = "outlaw-legend";

export type SummonCard = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  imageSrc: string;
  voiceLinePath?: string;
};

type CardDefinition = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  imagePath?: string;
  voiceLinePath?: string;
};

const tableName = process.env.DYNAMODB_USERS_TABLE;
const region = process.env.AWS_REGION;

const BANNER_POOLS: Record<BannerId, string[]> = {
  "outlaw-legend": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
};

const cardDefinitions = (cardsData.cards ?? []) as CardDefinition[];
const cardsById = new Map<string, CardDefinition>(
  cardDefinitions.map((card) => [card.id, card]),
);

type UserRecord = {
  PK?: string;
  SK?: string;
  id?: string;
  userId?: string;
  sub?: string;
};

let warnedMissingConfig = false;
let docClient: DynamoDBDocumentClient | null = null;

function getDocClient() {
  if (!region || !tableName) {
    if (!warnedMissingConfig) {
      console.warn(
        "DynamoDB summon writes disabled: set AWS_REGION and DYNAMODB_USERS_TABLE.",
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

function mapCardForResponse(card: CardDefinition): SummonCard {
  return {
    ...card,
    imageSrc: card.imagePath ?? "/card.png",
    voiceLinePath: card.voiceLinePath,
  };
}

export function isBannerId(value: string): value is BannerId {
  return value in BANNER_POOLS;
}

export function pickCardFromBanner(bannerId: BannerId): SummonCard {
  const pool = BANNER_POOLS[bannerId];
  const pickedId = pool[Math.floor(Math.random() * pool.length)];
  const selectedCard = cardsById.get(pickedId);

  if (!selectedCard) {
    throw new Error(`Card id ${pickedId} is missing from cards.json`);
  }

  return mapCardForResponse(selectedCard);
}

export class SummonError extends Error {
  constructor(
    public code:
      | "INSUFFICIENT_COINS"
      | "DB_CONFIG_MISSING"
      | "USER_NOT_FOUND",
    message: string,
  ) {
    super(message);
  }
}

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

  const items = (scanResponse.Items ?? []) as UserRecord[];
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

function buildKeyConditionExpression(key: Record<string, string>) {
  const keyEntries = Object.keys(key);
  const conditionParts: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};

  keyEntries.forEach((attributeName, index) => {
    const token = `#k${index}`;
    expressionAttributeNames[token] = attributeName;
    conditionParts.push(`attribute_exists(${token})`);
  });

  return {
    conditionExpression: conditionParts.join(" AND "),
    expressionAttributeNames,
  };
}

async function runSetSummonUpdate(
  client: DynamoDBDocumentClient,
  key: Record<string, string>,
  drawnCardId: string,
  nowIso: string,
) {
  if (!tableName) {
    throw new SummonError(
      "DB_CONFIG_MISSING",
      "Server storage is not configured for summons.",
    );
  }

  const { conditionExpression, expressionAttributeNames } =
    buildKeyConditionExpression(key);

  const response = await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression:
        "SET coins = coins - :cost, updatedAt = :updatedAt ADD ownedCardIds :ownedCardIds",
      ConditionExpression: `${conditionExpression} AND coins >= :cost`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ":cost": SINGLE_SUMMON_COST,
        ":updatedAt": nowIso,
        ":ownedCardIds": new Set([drawnCardId]),
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  return Number(response.Attributes?.coins ?? 0);
}

async function runListSummonUpdate(
  client: DynamoDBDocumentClient,
  key: Record<string, string>,
  drawnCardId: string,
  nowIso: string,
) {
  if (!tableName) {
    throw new SummonError(
      "DB_CONFIG_MISSING",
      "Server storage is not configured for summons.",
    );
  }

  const { conditionExpression, expressionAttributeNames } =
    buildKeyConditionExpression(key);

  const fallbackResponse = await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression:
        "SET coins = if_not_exists(coins, :zero) - :cost, updatedAt = :updatedAt, ownedCardIds = list_append(if_not_exists(ownedCardIds, :emptyList), :newOwnedCardIds)",
      ConditionExpression: `${conditionExpression} AND if_not_exists(coins, :zero) >= :cost`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ":zero": 0,
        ":cost": SINGLE_SUMMON_COST,
        ":updatedAt": nowIso,
        ":emptyList": [],
        ":newOwnedCardIds": [drawnCardId],
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  return Number(fallbackResponse.Attributes?.coins ?? 0);
}

export async function runSingleSummonForUser(
  userId: string,
  bannerId: BannerId,
) {
  const client = getDocClient();
  if (!client || !tableName) {
    throw new SummonError(
      "DB_CONFIG_MISSING",
      "Server storage is not configured for summons.",
    );
  }

  const drawnCard = pickCardFromBanner(bannerId);
  const nowIso = new Date().toISOString();
  const defaultKey = {
    PK: `USER#${userId}`,
    SK: "PROFILE",
  };

  try {
    const remainingCoins = await runSetSummonUpdate(
      client,
      defaultKey,
      drawnCard.id,
      nowIso,
    );

    return {
      card: drawnCard,
      remainingCoins: Number.isFinite(remainingCoins) ? remainingCoins : 0,
      cost: SINGLE_SUMMON_COST,
    };
  } catch (error) {
    if (isValidationException(error) || isConditionalCheckFailed(error)) {
      try {
        if (isValidationException(error)) {
          const remainingCoins = await runListSummonUpdate(
            client,
            defaultKey,
            drawnCard.id,
            nowIso,
          );
          return {
            card: drawnCard,
            remainingCoins: Number.isFinite(remainingCoins) ? remainingCoins : 0,
            cost: SINGLE_SUMMON_COST,
          };
        }
      } catch (fallbackError) {
        if (isConditionalCheckFailed(fallbackError)) {
          throw new SummonError(
            "INSUFFICIENT_COINS",
            `You need ${SINGLE_SUMMON_COST.toLocaleString()} coins for a summon.`,
          );
        }

        if (!isValidationException(fallbackError)) {
          throw fallbackError;
        }
      }

      const fallbackRecord = await findUserRecord(client, userId);
      if (!fallbackRecord) {
        throw new SummonError("USER_NOT_FOUND", "User profile not found.");
      }

      const keyCandidates = buildKeyCandidates(fallbackRecord);
      if (keyCandidates.length === 0) {
        throw new SummonError("USER_NOT_FOUND", "User profile key is missing.");
      }

      let lastError: unknown = null;
      for (const keyCandidate of keyCandidates) {
        try {
          const remainingCoins = await runSetSummonUpdate(
            client,
            keyCandidate,
            drawnCard.id,
            nowIso,
          );
          return {
            card: drawnCard,
            remainingCoins: Number.isFinite(remainingCoins) ? remainingCoins : 0,
            cost: SINGLE_SUMMON_COST,
          };
        } catch (setError) {
          if (isConditionalCheckFailed(setError)) {
            throw new SummonError(
              "INSUFFICIENT_COINS",
              `You need ${SINGLE_SUMMON_COST.toLocaleString()} coins for a summon.`,
            );
          }

          if (isValidationException(setError)) {
            try {
              const remainingCoins = await runListSummonUpdate(
                client,
                keyCandidate,
                drawnCard.id,
                nowIso,
              );
              return {
                card: drawnCard,
                remainingCoins: Number.isFinite(remainingCoins) ? remainingCoins : 0,
                cost: SINGLE_SUMMON_COST,
              };
            } catch (listError) {
              if (isConditionalCheckFailed(listError)) {
                throw new SummonError(
                  "INSUFFICIENT_COINS",
                  `You need ${SINGLE_SUMMON_COST.toLocaleString()} coins for a summon.`,
                );
              }
              if (isValidationException(listError)) {
                lastError = listError;
                continue;
              }
              throw listError;
            }
          }

          throw setError;
        }
      }

      throw lastError ?? new SummonError("USER_NOT_FOUND", "User profile not found.");
    }

    if (isConditionalCheckFailed(error)) {
      throw new SummonError(
        "INSUFFICIENT_COINS",
        `You need ${SINGLE_SUMMON_COST.toLocaleString()} coins for a summon.`,
      );
    }
    throw error;
  }
}
