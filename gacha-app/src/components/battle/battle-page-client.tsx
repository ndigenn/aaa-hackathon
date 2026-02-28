"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type BattleCard = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  imageSrc: string;
  attack: number;
  hp: number;
  abilities: Array<{
    name: string;
    description: string;
  }>;
};

type BattleUnit = {
  unitId: string;
  cardId: string;
  name: string;
  type: string;
  imageSrc: string;
  hp: number;
  maxHp: number;
  attack: number;
  acted: boolean;
  bonusAttack: number;
  vulnerableTurns: number;
  abilities: BattleCard["abilities"];
};

const ENEMY_TEAM_TEMPLATE: BattleUnit[] = [
  {
    unitId: "enemy-1",
    cardId: "enemy-1",
    name: "Bandit Scout",
    type: "DPS",
    imageSrc: "/card.png",
    hp: 260,
    maxHp: 260,
    attack: 58,
    acted: false,
    bonusAttack: 0,
    vulnerableTurns: 0,
    abilities: [{ name: "Quick Slash", description: "A fast strike for steady damage." }],
  },
  {
    unitId: "enemy-2",
    cardId: "enemy-2",
    name: "Bandit Bruiser",
    type: "Tank",
    imageSrc: "/card.png",
    hp: 320,
    maxHp: 320,
    attack: 50,
    acted: false,
    bonusAttack: 0,
    vulnerableTurns: 0,
    abilities: [{ name: "Heavy Swing", description: "A slower, stronger hit." }],
  },
  {
    unitId: "enemy-3",
    cardId: "enemy-3",
    name: "Bandit Sniper",
    type: "Debuffer",
    imageSrc: "/card.png",
    hp: 240,
    maxHp: 240,
    attack: 62,
    acted: false,
    bonusAttack: 0,
    vulnerableTurns: 0,
    abilities: [{ name: "Marked Shot", description: "A shot that leaves openings." }],
  },
];

function clampHp(unit: BattleUnit) {
  return { ...unit, hp: Math.max(0, Math.min(unit.hp, unit.maxHp)) };
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function aliveUnits(units: BattleUnit[]) {
  return units.filter((unit) => unit.hp > 0);
}

function buildPlayerUnits(cards: BattleCard[]) {
  return cards.slice(0, 3).map((card, index) => ({
    unitId: `player-${index + 1}`,
    cardId: card.id,
    name: card.name,
    type: card.type,
    imageSrc: card.imageSrc,
    hp: card.hp,
    maxHp: card.hp,
    attack: card.attack,
    acted: false,
    bonusAttack: 0,
    vulnerableTurns: 0,
    abilities: card.abilities,
  }));
}

export default function BattlePageClient({ availableCards }: { availableCards: BattleCard[] }) {
  const searchParams = useSearchParams();
  const enemyTurnLock = useRef(false);

  const selectedCards = useMemo(() => {
    const loadoutParam = searchParams.get("loadout") ?? "";
    const requestedIds = loadoutParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const fromQuery = requestedIds
      .map((id) => availableCards.find((card) => card.id === id))
      .filter(Boolean) as BattleCard[];

    const uniqueFromQuery: BattleCard[] = [];
    const seen = new Set<string>();
    for (const card of fromQuery) {
      if (seen.has(card.id)) continue;
      seen.add(card.id);
      uniqueFromQuery.push(card);
      if (uniqueFromQuery.length === 3) break;
    }

    if (uniqueFromQuery.length >= 3) return uniqueFromQuery.slice(0, 3);

    const fallback: BattleCard[] = [...uniqueFromQuery];
    for (const card of availableCards) {
      if (seen.has(card.id)) continue;
      fallback.push(card);
      seen.add(card.id);
      if (fallback.length === 3) break;
    }

    return fallback;
  }, [availableCards, searchParams]);

  const [playerUnits, setPlayerUnits] = useState<BattleUnit[]>(() =>
    buildPlayerUnits(selectedCards),
  );
  const [enemyUnits, setEnemyUnits] = useState<BattleUnit[]>(() =>
    ENEMY_TEAM_TEMPLATE.map((unit) => ({ ...unit })),
  );
  const [phase, setPhase] = useState<"player" | "enemy" | "finished">("player");
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [logLines, setLogLines] = useState<string[]>([
    "Battle started. Drag a friendly card onto an enemy card to attack.",
    "Each of your three cards acts once per turn, then enemies counterattack.",
  ]);
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [draggingUnitId, setDraggingUnitId] = useState<string | null>(null);
  const [turnNumber, setTurnNumber] = useState(1);

  const canBattle = selectedCards.length === 3;

  function appendLogs(lines: string[]) {
    if (lines.length === 0) return;
    setLogLines((current) => [...current, ...lines].slice(-14));
  }

  function applyPlayerAbility(
    attacker: BattleUnit,
    currentPlayers: BattleUnit[],
    currentEnemies: BattleUnit[],
    targetIndex: number,
    baseDamage: number,
  ) {
    let nextPlayers = [...currentPlayers];
      const nextEnemies = [...currentEnemies];
    let damage = baseDamage;
    const abilityLog: string[] = [];

    switch (attacker.type) {
      case "Healer": {
        const healTargets = nextPlayers
          .map((unit, index) => ({ unit, index }))
          .filter(({ unit }) => unit.hp > 0)
          .sort((a, b) => a.unit.hp - b.unit.hp);

        if (healTargets.length > 0) {
          const healIndex = healTargets[0].index;
          const healAmount = 55;
          nextPlayers[healIndex] = clampHp({
            ...nextPlayers[healIndex],
            hp: nextPlayers[healIndex].hp + healAmount,
          });
          abilityLog.push(`${attacker.name} uses healing support (+${healAmount} HP).`);
        }
        break;
      }
      case "Support": {
        nextPlayers = nextPlayers.map((unit) =>
          unit.hp > 0 ? { ...unit, bonusAttack: Math.min(unit.bonusAttack + 10, 30) } : unit,
        );
        abilityLog.push(`${attacker.name} buffs allied attack.`);
        break;
      }
      case "Debuffer": {
        const target = nextEnemies[targetIndex];
        nextEnemies[targetIndex] = {
          ...target,
          vulnerableTurns: Math.max(target.vulnerableTurns, 2),
        };
        abilityLog.push(`${attacker.name} inflicts Vulnerable on ${target.name}.`);
        break;
      }
      case "Tank": {
        damage = Math.round(damage * 0.8);
        const selfIndex = nextPlayers.findIndex((unit) => unit.unitId === attacker.unitId);
        if (selfIndex >= 0) {
          nextPlayers[selfIndex] = clampHp({
            ...nextPlayers[selfIndex],
            hp: nextPlayers[selfIndex].hp + 28,
          });
        }
        abilityLog.push(`${attacker.name} fortifies and shrugs off damage.`);
        break;
      }
      default: {
        if (attacker.type === "DPS" || attacker.type === "Sub DPS") {
          const attackerSlot = Number(attacker.unitId.split("-")[1] ?? "0");
          const critTrigger = (turnNumber + attackerSlot + targetIndex) % 3 === 0;
          if (critTrigger) {
            damage = Math.round(damage * 1.7);
            abilityLog.push(`${attacker.name} lands a critical ability strike!`);
          }
        }
      }
    }

    return { nextPlayers, nextEnemies, damage, abilityLog };
  }

  function resolvePlayerAttack(attackerId: string, targetId: string) {
    if (phase !== "player" || winner || !canBattle) return;

    const attackerIndex = playerUnits.findIndex((unit) => unit.unitId === attackerId && unit.hp > 0);
    const targetIndex = enemyUnits.findIndex((unit) => unit.unitId === targetId && unit.hp > 0);

    if (attackerIndex < 0 || targetIndex < 0) return;

    const attacker = playerUnits[attackerIndex];
    if (attacker.acted) return;

    const target = enemyUnits[targetIndex];
    let computedDamage = Math.max(20, attacker.attack + attacker.bonusAttack + randomInt(-8, 12));
    if (target.vulnerableTurns > 0) {
      computedDamage = Math.round(computedDamage * 1.2);
    }

    const { nextPlayers, nextEnemies, damage, abilityLog } = applyPlayerAbility(
      attacker,
      playerUnits,
      enemyUnits,
      targetIndex,
      computedDamage,
    );

    const enemyAfterHit = clampHp({
      ...nextEnemies[targetIndex],
      hp: nextEnemies[targetIndex].hp - damage,
      vulnerableTurns: Math.max(0, nextEnemies[targetIndex].vulnerableTurns - 1),
    });
    nextEnemies[targetIndex] = enemyAfterHit;

    nextPlayers[attackerIndex] = {
      ...nextPlayers[attackerIndex],
      acted: true,
    };

    const actionLogs = [
      `${attacker.name} hits ${target.name} for ${damage} damage.`,
      ...abilityLog,
    ];

    setPlayerUnits(nextPlayers);
    setEnemyUnits(nextEnemies);
    setSelectedAttackerId(null);
    appendLogs(actionLogs);

    if (aliveUnits(nextEnemies).length === 0) {
      setWinner("player");
      setPhase("finished");
      appendLogs(["You won the battle."]);
      return;
    }

    const alivePlayers = aliveUnits(nextPlayers);
    const allAlivePlayerUnitsActed = alivePlayers.every((unit) => unit.acted);
    if (allAlivePlayerUnitsActed) {
      setPhase("enemy");
      appendLogs(["Enemy turn starts."]);
    }
  }

  useEffect(() => {
    if (phase !== "enemy" || winner || enemyTurnLock.current) return;

    enemyTurnLock.current = true;
    const timeout = window.setTimeout(() => {
      let nextPlayers = [...playerUnits];
      const nextEnemies = [...enemyUnits];
      const newLogs: string[] = [];

      for (const enemy of nextEnemies) {
        if (enemy.hp <= 0) continue;

        const alivePlayerIndexes = nextPlayers
          .map((unit, index) => ({ unit, index }))
          .filter(({ unit }) => unit.hp > 0)
          .map(({ index }) => index);

        if (alivePlayerIndexes.length === 0) break;

        const targetIndex = alivePlayerIndexes[randomInt(0, alivePlayerIndexes.length - 1)];
        const damage = Math.max(16, enemy.attack + randomInt(-6, 10));

        nextPlayers[targetIndex] = clampHp({
          ...nextPlayers[targetIndex],
          hp: nextPlayers[targetIndex].hp - damage,
        });

        newLogs.push(`${enemy.name} strikes ${nextPlayers[targetIndex].name} for ${damage}.`);
      }

      if (aliveUnits(nextPlayers).length === 0) {
        setPlayerUnits(nextPlayers);
        setEnemyUnits(nextEnemies);
        appendLogs(newLogs);
        setWinner("enemy");
        setPhase("finished");
        appendLogs(["Your team was defeated."]);
        enemyTurnLock.current = false;
        return;
      }

      nextPlayers = nextPlayers.map((unit) =>
        unit.hp > 0
          ? { ...unit, acted: false, bonusAttack: Math.max(0, unit.bonusAttack - 5) }
          : unit,
      );

      setPlayerUnits(nextPlayers);
      setEnemyUnits(nextEnemies);
      setTurnNumber((turn) => turn + 1);
      setPhase("player");
      appendLogs([...newLogs, "Your turn starts."]);
      enemyTurnLock.current = false;
    }, 700);

    return () => {
      window.clearTimeout(timeout);
      enemyTurnLock.current = false;
    };
  }, [enemyUnits, phase, playerUnits, winner]);

  function handleResetBattle() {
    const resetPlayers = buildPlayerUnits(selectedCards);

    setPlayerUnits(resetPlayers);
    setEnemyUnits(ENEMY_TEAM_TEMPLATE.map((unit) => ({ ...unit })));
    setPhase("player");
    setWinner(null);
    setSelectedAttackerId(null);
    setDraggingUnitId(null);
    setTurnNumber(1);
    setLogLines([
      "Battle reset. Drag a friendly card onto an enemy card to attack.",
      "Each card acts once per turn.",
    ]);
  }

  if (!canBattle) {
    return (
      <section className="relative mx-auto w-full max-w-4xl px-4 pb-36 pt-28">
        <div className="rounded-2xl border border-[#f1cf8e]/45 bg-[#22160f]/70 p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.42)]">
          <h1 className="text-2xl font-extrabold text-[#ffe8b8]">Battle Unavailable</h1>
          <p className="mt-3 text-sm text-[#efd8b0]">
            Select three cards from Home loadout first, then start battle again.
          </p>
          <Link
            href="/home"
            className="mt-5 inline-block rounded-lg border border-[#ffe3a6]/80 bg-[linear-gradient(180deg,#ffdf95_0%,#d6a43d_100%)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#4a2b16]"
          >
            Go To Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-36 pt-28">
      <div className="rounded-2xl border border-[#f1cf8e]/45 bg-[#22160f]/70 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.42)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#ffe8b8]">Simple Battle</h1>
            <p className="text-sm text-[#efd8b0]">
              Turn {turnNumber} • {phase === "player" ? "Your turn" : phase === "enemy" ? "Enemy turn" : "Battle ended"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetBattle}
              className="rounded-lg border border-[#f0c67a]/55 bg-[#3a2348]/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffe8b8]"
            >
              Reset
            </button>
            <Link
              href="/home"
              className="rounded-lg border border-[#ffe3a6]/80 bg-[linear-gradient(180deg,#ffdf95_0%,#d6a43d_100%)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#4a2b16]"
            >
              Loadout
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-[#f0c67a]/35 bg-[#2a1b12]/55 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">Enemy Line</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {enemyUnits.map((unit) => {
                const defeated = unit.hp <= 0;
                return (
                  <button
                    key={unit.unitId}
                    type="button"
                    onClick={() => {
                      if (selectedAttackerId) {
                        resolvePlayerAttack(selectedAttackerId, unit.unitId);
                      }
                    }}
                    onDragOver={(event) => {
                      if (phase === "player") event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fromData = event.dataTransfer.getData("text/plain");
                      const attackerId = fromData || draggingUnitId;
                      if (attackerId) {
                        resolvePlayerAttack(attackerId, unit.unitId);
                      }
                      setDraggingUnitId(null);
                    }}
                    className={`rounded-lg border p-2 text-left transition ${
                      defeated
                        ? "border-white/15 bg-black/30 opacity-40"
                        : "border-[#f0c67a]/45 bg-[#4a2a1d]/70 hover:border-[#ffdba1]"
                    }`}
                  >
                    <div className="mx-auto h-24 w-16 overflow-hidden rounded-md border border-[#f3cd86]/50 bg-[#2a1b12]">
                      <Image
                        src={unit.imageSrc}
                        alt={unit.name}
                        width={64}
                        height={96}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#ffe8b8]">{unit.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#f4cd84]">
                      HP {unit.hp}/{unit.maxHp}
                    </p>
                    {unit.vulnerableTurns > 0 ? (
                      <p className="mt-1 text-[10px] text-[#ffdca0]">Vulnerable ({unit.vulnerableTurns})</p>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">Your Team</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {playerUnits.map((unit) => {
                const defeated = unit.hp <= 0;
                const canAct = phase === "player" && !unit.acted && !defeated && !winner;
                const selected = selectedAttackerId === unit.unitId;
                const ability = unit.abilities[0];

                return (
                  <button
                    key={unit.unitId}
                    type="button"
                    draggable={canAct}
                    onClick={() => {
                      if (canAct) {
                        setSelectedAttackerId((current) =>
                          current === unit.unitId ? null : unit.unitId,
                        );
                      }
                    }}
                    onDragStart={(event) => {
                      setDraggingUnitId(unit.unitId);
                      event.dataTransfer.setData("text/plain", unit.unitId);
                    }}
                    onDragEnd={() => setDraggingUnitId(null)}
                    className={`rounded-lg border p-2 text-left transition ${
                      defeated
                        ? "border-white/15 bg-black/30 opacity-40"
                        : selected
                          ? "border-[#ffe3a8] bg-[#5a3320]/85"
                          : canAct
                            ? "border-[#f0c67a]/55 bg-[#3b2248]/78 hover:border-[#ffdba1]"
                            : "border-[#f0c67a]/30 bg-[#3b2248]/48"
                    }`}
                  >
                    <div className="mx-auto h-24 w-16 overflow-hidden rounded-md border border-[#f3cd86]/50 bg-[#2a1b12]">
                      <Image
                        src={unit.imageSrc}
                        alt={unit.name}
                        width={64}
                        height={96}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-[#ffe8b8]">{unit.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[#f4cd84]">
                      HP {unit.hp}/{unit.maxHp} • ATK {unit.attack + unit.bonusAttack}
                    </p>
                    {ability ? (
                      <p className="mt-1 line-clamp-2 text-[10px] text-[#f0ddb9]">
                        {ability.name}: {ability.description}
                      </p>
                    ) : null}
                    {unit.acted && !defeated ? (
                      <p className="mt-1 text-[10px] font-semibold text-[#ffdca0]">Acted this turn</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="rounded-xl border border-[#f0c67a]/35 bg-[#2a1b12]/55 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">Battle Log</p>
            <div className="mt-2 h-[360px] overflow-auto rounded-md border border-[#f0c67a]/20 bg-black/25 p-2">
              {logLines.map((line, index) => (
                <p key={`${line}-${index}`} className="mb-1 text-xs text-[#efd8b0]">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[#efd8b0]">
              Tip: Drag a friendly card and drop it on an enemy to attack.
            </p>
            {winner ? (
              <p className="mt-3 rounded-md border border-[#f0c67a]/40 bg-[#3a2348]/60 px-2 py-2 text-sm font-bold text-[#ffe8b8]">
                {winner === "player" ? "Victory" : "Defeat"}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
