import cardsData from "@/app/cards.json";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const SINGLE_SUMMON_COST = 1000;

export type BannerId = "outlaw-legend" | "cowgirl-hero";

export type SummonCard = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  imageSrc: string;
};

type CardDefinition = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
};

const tableName = process.env.DYNAMODB_USERS_TABLE;
const region = process.env.AWS_REGION;

const CARD_IMAGE_BY_NAME: Record<string, string> = {
  "billy the kid": "/billie.png",
  "wyatt earp": "/wynne.png",
  "butch cassidy": "/sunny.png",
  "calamity jane": "/jane.png",
  "doc holiday": "/doc.png",
  "bass reaves": "/bass.png",
  "belle starr": "/belle.png",
  "charles goodnight": "/goodnight.png",
};

const BANNER_POOLS: Record<BannerId, string[]> = {
  "outlaw-legend": ["1", "3", "5", "7", "8"],
  "cowgirl-hero": ["2", "4", "6", "9", "10"],
};

const cardDefinitions = (cardsData.cards ?? []) as CardDefinition[];
const cardsById = new Map<string, CardDefinition>(
  cardDefinitions.map((card) => [card.id, card]),
);

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
    imageSrc: CARD_IMAGE_BY_NAME[card.name.toLowerCase()] ?? "/card.png",
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

  try {
    const nowIso = new Date().toISOString();
    const response = await client.send(
      new UpdateCommand({
        TableName: tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: "PROFILE",
        },
        UpdateExpression:
          "SET coins = coins - :cost, updatedAt = :updatedAt ADD ownedCardIds :ownedCardIds",
        ConditionExpression:
          "attribute_exists(PK) AND attribute_exists(SK) AND coins >= :cost",
        ExpressionAttributeValues: {
          ":cost": SINGLE_SUMMON_COST,
          ":updatedAt": nowIso,
          ":ownedCardIds": new Set([drawnCard.id]),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    const remainingCoins = Number(response.Attributes?.coins ?? 0);

    return {
      card: drawnCard,
      remainingCoins: Number.isFinite(remainingCoins) ? remainingCoins : 0,
      cost: SINGLE_SUMMON_COST,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      throw new SummonError(
        "INSUFFICIENT_COINS",
        `You need ${SINGLE_SUMMON_COST.toLocaleString()} coins for a summon.`,
      );
    }
    throw error;
  }
}
