"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

type AttackAnimation = {
  attackerId: string;
  targetId: string;
  kind: string;
};

const ENEMY_TEAM_TEMPLATE: BattleUnit[] = [
  {
    unitId: "enemy-1",
    cardId: "enemy-1",
    name: "Bandit Scout",
    type: "DPS",
    imageSrc: "/scout.png",
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
    imageSrc: "/bruiser.png",
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
    imageSrc: "/sniper.png",
    hp: 240,
    maxHp: 240,
    attack: 62,
    acted: false,
    bonusAttack: 0,
    vulnerableTurns: 0,
    abilities: [{ name: "Marked Shot", description: "A shot that leaves openings." }],
  },
];

const ANIMATION_LIST = [
  "Quick Slash: fast swipe hit",
  "Heavy Swing: bruiser slam",
  "Marked Shot: sniper burst",
  "Heal Pulse: recover lowest ally",
  "Buff Aura: increase ally attack",
  "Vulnerable Mark: target takes extra damage",
  "Critical Burst: amplified DPS strike",
  "KO Mark: red X on defeated unit",
];

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

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

function getPlayerAnimationKind(attacker: BattleUnit) {
  switch (attacker.type) {
    case "Healer":
      return "Heal Pulse";
    case "Support":
      return "Buff Aura";
    case "Debuffer":
      return "Vulnerable Mark";
    case "Tank":
      return "Shield Bash";
    default:
      return "Quick Slash";
  }
}

function getEnemyAnimationKind(enemy: BattleUnit) {
  if (enemy.name.includes("Sniper")) return "Marked Shot";
  if (enemy.name.includes("Bruiser")) return "Heavy Swing";
  return "Quick Slash";
}

export default function BattlePageClient({
  availableCards,
  initialLoadoutParam,
}: {
  availableCards: BattleCard[];
  initialLoadoutParam: string;
}) {
  const enemyTurnLock = useRef(false);
  const animationTimerRef = useRef<number | null>(null);

  const selectedCards = useMemo(() => {
    const requestedIds = initialLoadoutParam
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
  }, [availableCards, initialLoadoutParam]);

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
  const [attackAnimation, setAttackAnimation] = useState<AttackAnimation | null>(null);

  const playerUnitsRef = useRef(playerUnits);
  const enemyUnitsRef = useRef(enemyUnits);

  useEffect(() => {
    playerUnitsRef.current = playerUnits;
  }, [playerUnits]);

  useEffect(() => {
    enemyUnitsRef.current = enemyUnits;
  }, [enemyUnits]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const canBattle = selectedCards.length === 3;

  function appendLogs(lines: string[]) {
    if (lines.length === 0) return;
    setLogLines((current) => [...current, ...lines].slice(-16));
  }

  function playAnimation(kind: string, attackerId: string, targetId: string, duration = 480) {
    if (animationTimerRef.current !== null) {
      window.clearTimeout(animationTimerRef.current);
    }

    setAttackAnimation({ attackerId, targetId, kind });
    animationTimerRef.current = window.setTimeout(() => {
      setAttackAnimation(null);
      animationTimerRef.current = null;
    }, duration);
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
    let attackKind = getPlayerAnimationKind(attacker);
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
          abilityLog.push(`[Heal Pulse] ${attacker.name} restores ${healAmount} HP.`);
        }
        break;
      }
      case "Support": {
        nextPlayers = nextPlayers.map((unit) =>
          unit.hp > 0 ? { ...unit, bonusAttack: Math.min(unit.bonusAttack + 10, 30) } : unit,
        );
        abilityLog.push(`[Buff Aura] ${attacker.name} raises ally attack.`);
        break;
      }
      case "Debuffer": {
        const target = nextEnemies[targetIndex];
        nextEnemies[targetIndex] = {
          ...target,
          vulnerableTurns: Math.max(target.vulnerableTurns, 2),
        };
        abilityLog.push(`[Vulnerable Mark] ${target.name} is exposed.`);
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
        abilityLog.push(`[Shield Bash] ${attacker.name} braces and counter-slams.`);
        break;
      }
      default: {
        if (attacker.type === "DPS" || attacker.type === "Sub DPS") {
          const attackerSlot = Number(attacker.unitId.split("-")[1] ?? "0");
          const critTrigger = (turnNumber + attackerSlot + targetIndex) % 3 === 0;
          if (critTrigger) {
            damage = Math.round(damage * 1.7);
            attackKind = "Critical Burst";
            abilityLog.push(`[Critical Burst] ${attacker.name} lands a critical strike.`);
          }
        }
      }
    }

    return { nextPlayers, nextEnemies, damage, abilityLog, attackKind };
  }

  function resolvePlayerAttack(attackerId: string, targetId: string) {
    if (phase !== "player" || winner || !canBattle) return;

    const attackerIndex = playerUnits.findIndex(
      (unit) => unit.unitId === attackerId && unit.hp > 0,
    );
    const targetIndex = enemyUnits.findIndex(
      (unit) => unit.unitId === targetId && unit.hp > 0,
    );

    if (attackerIndex < 0 || targetIndex < 0) return;

    const attacker = playerUnits[attackerIndex];
    if (attacker.acted) return;

    const target = enemyUnits[targetIndex];
    let computedDamage = Math.max(
      20,
      attacker.attack + attacker.bonusAttack + randomInt(-8, 12),
    );
    if (target.vulnerableTurns > 0) {
      computedDamage = Math.round(computedDamage * 1.2);
    }

    const { nextPlayers, nextEnemies, damage, abilityLog, attackKind } = applyPlayerAbility(
      attacker,
      playerUnits,
      enemyUnits,
      targetIndex,
      computedDamage,
    );

    nextEnemies[targetIndex] = clampHp({
      ...nextEnemies[targetIndex],
      hp: nextEnemies[targetIndex].hp - damage,
      vulnerableTurns: Math.max(0, nextEnemies[targetIndex].vulnerableTurns - 1),
    });

    nextPlayers[attackerIndex] = {
      ...nextPlayers[attackerIndex],
      acted: true,
    };

    playAnimation(attackKind, attacker.unitId, target.unitId);

    setPlayerUnits(nextPlayers);
    setEnemyUnits(nextEnemies);
    setSelectedAttackerId(null);
    appendLogs([
      `[${attackKind}] ${attacker.name} hits ${target.name} for ${damage}.`,
      ...abilityLog,
    ]);

    if (aliveUnits(nextEnemies).length === 0) {
      setWinner("player");
      setPhase("finished");
      appendLogs(["Victory! Enemy team eliminated."]);
      return;
    }

    const allAlivePlayerUnitsActed = aliveUnits(nextPlayers).every((unit) => unit.acted);
    if (allAlivePlayerUnitsActed) {
      setPhase("enemy");
      appendLogs(["Enemy turn starts."]);
    }
  }

  useEffect(() => {
    if (phase !== "enemy" || winner || enemyTurnLock.current) return;

    enemyTurnLock.current = true;
    let cancelled = false;

    const runEnemyTurn = async () => {
      let nextPlayers = [...playerUnitsRef.current];
      const nextEnemies = [...enemyUnitsRef.current];
      const roundLogs: string[] = [];

      for (const enemy of nextEnemies) {
        if (cancelled) return;
        if (enemy.hp <= 0) continue;

        const alivePlayerIndexes = nextPlayers
          .map((unit, index) => ({ unit, index }))
          .filter(({ unit }) => unit.hp > 0)
          .map(({ index }) => index);

        if (alivePlayerIndexes.length === 0) break;

        const targetIndex = alivePlayerIndexes[randomInt(0, alivePlayerIndexes.length - 1)];
        const target = nextPlayers[targetIndex];
        const damage = Math.max(16, enemy.attack + randomInt(-6, 10));
        const attackKind = getEnemyAnimationKind(enemy);

        playAnimation(attackKind, enemy.unitId, target.unitId, 420);
        await sleep(360);

        nextPlayers[targetIndex] = clampHp({
          ...nextPlayers[targetIndex],
          hp: nextPlayers[targetIndex].hp - damage,
        });

        setPlayerUnits([...nextPlayers]);
        roundLogs.push(`[${attackKind}] ${enemy.name} hits ${target.name} for ${damage}.`);
        appendLogs([roundLogs[roundLogs.length - 1]]);

        await sleep(260);
      }

      if (cancelled) return;

      if (aliveUnits(nextPlayers).length === 0) {
        setPlayerUnits(nextPlayers);
        setEnemyUnits(nextEnemies);
        setWinner("enemy");
        setPhase("finished");
        appendLogs(["Loss! Your team was defeated."]);
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
      appendLogs(["Your turn starts."]);
      enemyTurnLock.current = false;
    };

    void runEnemyTurn();

    return () => {
      cancelled = true;
      enemyTurnLock.current = false;
    };
  }, [phase, winner]);

  function handleResetBattle() {
    setPlayerUnits(buildPlayerUnits(selectedCards));
    setEnemyUnits(ENEMY_TEAM_TEMPLATE.map((unit) => ({ ...unit })));
    setPhase("player");
    setWinner(null);
    setSelectedAttackerId(null);
    setDraggingUnitId(null);
    setTurnNumber(1);
    setAttackAnimation(null);
    setLogLines([
      "Battle reset. Drag a friendly card onto an enemy card to attack.",
      "Each card acts once per turn.",
    ]);
  }

  function getAnimatedUnitStyle(unitId: string, defeated: boolean) {
    const isAttacker = attackAnimation?.attackerId === unitId;
    const isTarget = attackAnimation?.targetId === unitId;

    return {
      transform: defeated
        ? "scale(0.94) rotate(-4deg)"
        : isAttacker
          ? "translateY(-8px) scale(1.06)"
          : isTarget
            ? "scale(0.92)"
            : "scale(1)",
      boxShadow: isTarget
        ? "0 0 0 2px rgba(239,68,68,0.9), 0 0 18px rgba(239,68,68,0.6)"
        : isAttacker
          ? "0 0 16px rgba(250,204,21,0.5)"
          : "none",
      filter: defeated ? "grayscale(1)" : "none",
      transition: "transform 220ms ease, box-shadow 220ms ease, filter 220ms ease",
    };
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
    <>
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-36 pt-28">
        <div className="rounded-2xl border border-[#f1cf8e]/45 bg-[#22160f]/70 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.42)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-[#ffe8b8]">Simple Battle</h1>
              <p className="text-sm text-[#efd8b0]">
                Turn {turnNumber} •{" "}
                {phase === "player"
                  ? "Your turn"
                  : phase === "enemy"
                    ? "Enemy turn"
                    : "Battle ended"}
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
            <div className="relative overflow-hidden rounded-xl border border-[#f0c67a]/35 p-3">
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/field.png')" }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,10,8,0.52)_0%,rgba(18,12,9,0.6)_46%,rgba(21,14,10,0.76)_100%)]" />

              <div className="relative">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">
                  Enemy Line
                </p>
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
                        style={getAnimatedUnitStyle(unit.unitId, defeated)}
                        className={`relative rounded-lg border p-2 text-left ${
                          defeated
                            ? "border-red-500/70 bg-black/45"
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
                          <p className="mt-1 text-[10px] text-[#ffdca0]">
                            Vulnerable ({unit.vulnerableTurns})
                          </p>
                        ) : null}
                        {defeated ? (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/35">
                            <span className="text-4xl font-black text-red-400">X</span>
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">
                  Your Team
                </p>
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
                        style={getAnimatedUnitStyle(unit.unitId, defeated)}
                        className={`relative rounded-lg border p-2 text-left ${
                          defeated
                            ? "border-red-500/70 bg-black/45"
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
                          <p className="mt-1 text-[10px] font-semibold text-[#ffdca0]">
                            Acted this turn
                          </p>
                        ) : null}
                        {defeated ? (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-red-900/35">
                            <span className="text-4xl font-black text-red-400">X</span>
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="rounded-xl border border-[#f0c67a]/35 bg-[#2a1b12]/55 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">
                Battle Log
              </p>
              <div className="mt-2 h-[240px] overflow-auto rounded-md border border-[#f0c67a]/20 bg-black/25 p-2">
                {logLines.map((line, index) => (
                  <p key={`${line}-${index}`} className="mb-1 text-xs text-[#efd8b0]">
                    {line}
                  </p>
                ))}
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4cd84]">
                Animation List
              </p>
              <div className="mt-2 rounded-md border border-[#f0c67a]/20 bg-black/25 p-2">
                {ANIMATION_LIST.map((item) => (
                  <p key={item} className="mb-1 text-[11px] text-[#efd8b0] last:mb-0">
                    {item}
                  </p>
                ))}
              </div>

              <p className="mt-2 text-[10px] text-[#efd8b0]">
                Tip: Drag a friendly card and drop it on an enemy to attack.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {winner ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#f0c67a]/55 bg-[linear-gradient(160deg,#2c1c37_0%,#3b2248_55%,#4a2a1d_100%)] p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.58)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f4cd84]">Battle Result</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#ffe8b8]">
              {winner === "player" ? "Victory!" : "Loss!"}
            </h2>
            <p className="mt-3 text-sm text-[#efd8b0]">
              {winner === "player"
                ? "Your team dominated the battlefield."
                : "The bandits won this round."}
            </p>

            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={handleResetBattle}
                className="rounded-lg border border-[#f0c67a]/55 bg-[#3a2348]/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#ffe8b8]"
              >
                Rematch
              </button>
              <Link
                href="/home"
                className="rounded-lg border border-[#ffe3a6]/80 bg-[linear-gradient(180deg,#ffdf95_0%,#d6a43d_100%)] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#4a2b16]"
              >
                Main Menu
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
