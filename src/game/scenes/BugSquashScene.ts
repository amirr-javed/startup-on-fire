import Phaser from "phaser";

import type { GameOverlay, GameUiBridge, GameUiState } from "../events/GameUiBridge";
import type { DigitalInput } from "../input/DigitalInput";
import type { QuestSession } from "../quests/QuestSession";
import type { GameplayBackend } from "../../types/gameplay";

const ROUND_SECONDS = 30;
const TARGET_SCORE = 8;
const MAX_ACTIVE_BUGS = 4;

type BugSquashServices = Readonly<{
  input: DigitalInput;
  uiBridge: GameUiBridge;
  questSession: QuestSession;
  gameplayBackend: GameplayBackend | null;
}>;

type RoundStatus = "preparing" | "playing" | "completing" | "success" | "failed" | "error";

export class BugSquashScene extends Phaser.Scene {
  readonly #input: DigitalInput;
  readonly #uiBridge: GameUiBridge;
  readonly #questSession: QuestSession;
  readonly #gameplayBackend: GameplayBackend | null;
  readonly #bugs = new Set<Phaser.GameObjects.Sprite>();
  #space!: Phaser.Input.Keyboard.Key;
  #escape!: Phaser.Input.Keyboard.Key;
  #score = 0;
  #secondsRemaining = ROUND_SECONDS;
  #remainingMs = ROUND_SECONDS * 1000;
  #status: RoundStatus = "preparing";
  #lastPublishedSecond = ROUND_SECONDS;
  #attemptId: string | null = null;
  #minimumElapsedMs = 0;
  #roundStartedAt = 0;
  #roundGeneration = 0;
  #hitPending = false;
  #serverProtected = false;
  #errorMessage = "Protected quest sync is unavailable. Retry it, or play a local practice round.";

  public constructor(services: BugSquashServices) {
    super("bug-squash");
    this.#input = services.input;
    this.#uiBridge = services.uiBridge;
    this.#questSession = services.questSession;
    this.#gameplayBackend = services.gameplayBackend;
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#18251d");
    this.#drawBoard();
    this.#createAnimations();

    const keyboard = this.input.keyboard;
    if (keyboard === null) throw new Error("Keyboard input unavailable.");
    this.#space = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.#escape = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.time.addEvent({
      delay: 700,
      loop: true,
      callback: () => this.#spawnBug(),
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.#roundGeneration += 1;
      this.#clearBugs();
      this.#input.reset();
    });
    this.#startRound();
  }

  public override update(_time: number, delta: number): void {
    const action = this.#input.consumeUiAction();
    if (this.#status === "playing") {
      this.#remainingMs = Math.max(0, this.#remainingMs - delta);
      this.#secondsRemaining = Math.ceil(this.#remainingMs / 1000);
      if (this.#secondsRemaining !== this.#lastPublishedSecond) {
        this.#lastPublishedSecond = this.#secondsRemaining;
        this.#publish();
      }
      if (this.#secondsRemaining === 0) {
        this.#finishRound(false);
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.#space) || action === "primary") {
        const target = this.#bugs.values().next().value as Phaser.GameObjects.Sprite | undefined;
        if (target !== undefined) this.#squash(target);
      }
      if (Phaser.Input.Keyboard.JustDown(this.#escape) || action === "secondary") {
        this.#questSession.resetKindredQuest();
        this.scene.start("plaza");
      }
      return;
    }

    if (action === "primary") {
      if (this.#status === "success") this.scene.start("plaza");
      else if (this.#status === "failed") this.#startRound();
      else if (this.#status === "error") this.#startPracticeRound();
    }
    if (action === "secondary" && this.#status === "error") {
      this.#startRound();
      return;
    }
    if (action === "secondary" || Phaser.Input.Keyboard.JustDown(this.#escape)) {
      this.#questSession.resetKindredQuest();
      this.scene.start("plaza");
    }
  }

  #drawBoard(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x233b2b, 1);
    graphics.fillRoundedRect(20, 42, 440, 208, 8);
    graphics.lineStyle(2, 0xffc247, 0.6);
    graphics.strokeRoundedRect(20, 42, 440, 208, 8);
    graphics.lineStyle(1, 0x31543c, 0.8);
    for (let x = 36; x < 460; x += 32) graphics.lineBetween(x, 44, x, 248);
    for (let y = 58; y < 250; y += 32) graphics.lineBetween(22, y, 458, y);

    this.add
      .text(24, 14, "KINDRED LABS // RELEASE BOARD", {
        color: "#ffc247",
        fontFamily: "monospace",
        fontSize: "10px",
      })
      .setResolution(2);
  }

  #createAnimations(): void {
    if (!this.anims.exists("bug-crawl")) {
      this.anims.create({
        key: "bug-crawl",
        frames: this.anims.generateFrameNumbers("bug", { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("bug-hit")) {
      this.anims.create({
        key: "bug-hit",
        frames: this.anims.generateFrameNumbers("hit", { start: 0, end: 3 }),
        frameRate: 16,
        repeat: 0,
        hideOnComplete: true,
      });
    }
  }

  #startRound(): void {
    this.#resetRound(this.#gameplayBackend !== null);
  }

  #startPracticeRound(): void {
    this.#resetRound(false);
  }

  #resetRound(serverProtected: boolean): void {
    const generation = ++this.#roundGeneration;
    this.#clearBugs();
    this.#score = 0;
    this.#secondsRemaining = ROUND_SECONDS;
    this.#lastPublishedSecond = ROUND_SECONDS;
    this.#remainingMs = ROUND_SECONDS * 1000;
    this.#attemptId = null;
    this.#minimumElapsedMs = 0;
    this.#roundStartedAt = performance.now();
    this.#hitPending = false;
    this.#serverProtected = serverProtected;
    this.#status = serverProtected ? "preparing" : "playing";
    if (this.#status === "playing") this.#spawnBug();
    this.#publish();
    if (serverProtected) void this.#prepareServerRound(generation);
  }

  async #prepareServerRound(generation: number): Promise<void> {
    try {
      const result = await this.#gameplayBackend!.startQuest("kindred-labs");
      if (generation !== this.#roundGeneration || !this.scene.isActive()) return;
      if (result.status === "rejected") {
        this.#failSync(
          "Protected quest sync could not start this run. Retry it, or play a local practice round.",
        );
        return;
      }
      this.#attemptId = result.attemptId;
      this.#minimumElapsedMs = result.minimumElapsedMs;
      this.#remainingMs = Math.min(ROUND_SECONDS * 1000, result.maximumElapsedMs - 500);
      this.#secondsRemaining = Math.ceil(this.#remainingMs / 1000);
      this.#lastPublishedSecond = this.#secondsRemaining;
      this.#roundStartedAt = performance.now();
      this.#status = "playing";
      this.#spawnBug();
      this.#publish();
    } catch {
      if (generation === this.#roundGeneration && this.scene.isActive()) {
        this.#failSync(
          "Protected quest sync is unavailable. Retry it, or play a local practice round.",
        );
      }
    }
  }

  #spawnBug(): void {
    if (this.#status !== "playing" || this.#bugs.size >= MAX_ACTIVE_BUGS) return;
    const bug = this.add
      .sprite(Phaser.Math.Between(48, 432), Phaser.Math.Between(70, 220), "bug", 0)
      .setScale(1.5)
      .setInteractive({ cursor: "pointer", useHandCursor: true })
      .play("bug-crawl");
    this.#bugs.add(bug);
    bug.once(Phaser.Input.Events.POINTER_DOWN, () => this.#squash(bug));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      this.tweens.add({
        targets: bug,
        x: Phaser.Math.Clamp(bug.x + Phaser.Math.Between(-70, 70), 42, 438),
        y: Phaser.Math.Clamp(bug.y + Phaser.Math.Between(-40, 40), 66, 226),
        duration: Phaser.Math.Between(900, 1500),
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }

    this.time.delayedCall(2600, () => {
      if (!bug.active) return;
      this.#bugs.delete(bug);
      bug.destroy();
    });
  }

  #squash(bug: Phaser.GameObjects.Sprite): void {
    if (this.#status !== "playing" || !bug.active || this.#hitPending) return;
    const gameplayBackend = this.#gameplayBackend;
    if (!this.#serverProtected || gameplayBackend === null) {
      this.#acceptSquash(bug, this.#score + 1);
      return;
    }
    const attemptId = this.#attemptId;
    if (attemptId === null) return;
    this.#hitPending = true;
    bug.disableInteractive();
    const generation = this.#roundGeneration;
    const hitKey = `bug-${crypto.randomUUID()}`;
    void gameplayBackend
      .recordQuestHit(attemptId, hitKey)
      .then((result) => {
        if (generation !== this.#roundGeneration || this.#status !== "playing") return;
        this.#hitPending = false;
        if (result.status === "recorded") {
          this.#acceptSquash(bug, result.hitCount);
          return;
        }
        if (result.reason === "hit_too_fast") {
          if (bug.active) bug.setInteractive({ cursor: "pointer", useHandCursor: true });
          return;
        }
        this.#failSync(
          "Protected quest sync was lost. Retry it, or restart as a local practice round.",
        );
      })
      .catch(() => {
        if (generation === this.#roundGeneration && this.#status === "playing") {
          this.#hitPending = false;
          this.#failSync(
            "Protected quest sync was lost. Retry it, or restart as a local practice round.",
          );
        }
      });
  }

  #acceptSquash(bug: Phaser.GameObjects.Sprite, score: number): void {
    if (!bug.active) return;
    const { x, y } = bug;
    this.#bugs.delete(bug);
    bug.destroy();
    const hit = this.add.sprite(x, y, "hit", 0).play("bug-hit");
    hit.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => hit.destroy());
    this.#score = score;
    if (this.#score >= TARGET_SCORE) this.#finishRound(true);
    else this.#publish();
  }

  #finishRound(success: boolean): void {
    if (this.#status !== "playing") return;
    if (!success || !this.#serverProtected) {
      this.#status = success ? "success" : "failed";
      this.#clearBugs();
      if (success) this.#questSession.completeKindredQuest("local");
      this.#publish();
      return;
    }
    this.#status = "completing";
    this.#clearBugs();
    this.#publish();
    const waitMs = Math.max(0, this.#minimumElapsedMs - (performance.now() - this.#roundStartedAt));
    const generation = this.#roundGeneration;
    this.time.delayedCall(waitMs, () => void this.#completeServerRound(generation));
  }

  async #completeServerRound(generation: number): Promise<void> {
    const attemptId = this.#attemptId;
    if (attemptId === null) return;
    try {
      const result = await this.#gameplayBackend!.completeQuest(attemptId);
      if (generation !== this.#roundGeneration || !this.scene.isActive()) return;
      if (result.status === "completed") {
        this.#status = "success";
        this.#questSession.completeKindredQuest("server");
        this.#publish();
        return;
      }
      this.#failSync(
        "Protected quest sync could not confirm this run. Retry it to earn a server-saved spark.",
      );
    } catch {
      if (generation === this.#roundGeneration && this.scene.isActive()) {
        this.#failSync(
          "Protected quest sync could not confirm this run. Retry it to earn a server-saved spark.",
        );
      }
    }
  }

  #failSync(message: string): void {
    this.#errorMessage = message;
    this.#status = "error";
    this.#clearBugs();
    this.#publish();
  }

  #clearBugs(): void {
    for (const bug of this.#bugs) bug.destroy();
    this.#bugs.clear();
  }

  #publish(): void {
    const overlay: GameOverlay = {
      kind: "minigame",
      status: this.#status,
      title:
        this.#status === "success"
          ? "Release board cleared!"
          : this.#status === "failed"
            ? "A few bugs slipped through"
            : this.#status === "preparing"
              ? "Opening the release board…"
              : this.#status === "completing"
                ? "Confirming your run…"
                : this.#status === "error"
                  ? "Protected sync unavailable"
                  : "Bug Squash",
      body:
        this.#status === "success"
          ? `You earned a ${this.#serverProtected ? "server-saved " : "local "}Practice Spark. Take it back to Maya.`
          : this.#status === "failed"
            ? "You kept the board safer. Try again to earn the spark."
            : this.#status === "preparing"
              ? "Creating a protected guest run. Your score will be checked by Fire City."
              : this.#status === "completing"
                ? "All 8 hits are recorded. Fire City is confirming the quest result."
                : this.#status === "error"
                  ? this.#errorMessage
                  : "Click bugs or press Space. Squash 8 before the timer reaches zero.",
      score: this.#score,
      target: TARGET_SCORE,
      secondsRemaining: this.#secondsRemaining,
      primaryLabel:
        this.#status === "success"
          ? "Return to Maya"
          : this.#status === "failed"
            ? "Try again"
            : this.#status === "error"
              ? "Play practice round"
              : this.#status === "preparing" || this.#status === "completing"
                ? undefined
                : "Squash target · Space",
      secondaryLabel:
        this.#status === "error"
          ? "Retry protected sync"
          : this.#status === "playing" ||
              this.#status === "preparing" ||
              this.#status === "completing"
            ? "Leave quest"
            : "Back to plaza",
    };
    const state: GameUiState = {
      nearbyBooth: null,
      openBooth: null,
      discoveredCount: 1,
      totalBooths: 3,
      objective: `Squash ${TARGET_SCORE} bugs · ${this.#score}/${TARGET_SCORE}`,
      overlay,
      publicFuelOffer: null,
    };
    this.#uiBridge.publish(state);
  }
}
