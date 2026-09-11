import Phaser from "phaser";

import type { GameOverlay, GameUiBridge, GameUiState } from "../events/GameUiBridge";
import type { DigitalInput } from "../input/DigitalInput";
import type { QuestSession } from "../quests/QuestSession";
import { dialoguePagesFor } from "../quests/questContent";
import type { GameplayBackend, RealtimeBooth } from "../../types/gameplay";
import {
  BOOTHS,
  CITY_CENTER,
  DECORATIONS,
  EMBER_GUIDE,
  FIRES,
  INTERACTION_RADIUS,
  PLAYER_SPEED,
  PLAZA_COLUMNS,
  PLAZA_HEIGHT,
  PLAZA_ROWS,
  PLAZA_WIDTH,
  SCOUT_SPAWN,
  TILE_SIZE,
  tileFrameAt,
  type BoothPlacement,
} from "../world/plazaLayout";

type PlazaServices = Readonly<{
  input: DigitalInput;
  uiBridge: GameUiBridge;
  questSession: QuestSession;
  gameplayBackend: GameplayBackend | null;
}>;

type KeyMap = Record<
  "up" | "down" | "left" | "right" | "interact" | "dismiss" | "confirm",
  Phaser.Input.Keyboard.Key
>;

function fireScale(tier: "cold" | "hot" | "blazing"): number {
  return { cold: 0.34, hot: 0.47, blazing: 0.62 }[tier];
}

export class PlazaScene extends Phaser.Scene {
  readonly #input: DigitalInput;
  readonly #uiBridge: GameUiBridge;
  readonly #questSession: QuestSession;
  readonly #gameplayBackend: GameplayBackend | null;
  readonly #fireSprites = new Map<string, Phaser.GameObjects.Sprite>();
  readonly #boothStates = new Map<string, RealtimeBooth>();
  #unsubscribeBooths: (() => void) | null = null;
  #player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  #cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  #keys!: KeyMap;
  #nearby: BoothPlacement | null = null;
  #openBooth: BoothPlacement | null = null;
  #facing: "down" | "left" | "right" | "up" = "down";
  #introStep: 0 | 1 | null = null;
  #dialoguePage = 0;
  #showQuestComplete = false;

  public constructor(services: PlazaServices) {
    super("plaza");
    this.#input = services.input;
    this.#uiBridge = services.uiBridge;
    this.#questSession = services.questSession;
    this.#gameplayBackend = services.gameplayBackend;
  }

  public create(): void {
    this.#fireSprites.clear();
    this.#nearby = null;
    this.#openBooth = null;
    this.#introStep = this.#questSession.introCompleted ? null : 0;
    this.#showQuestComplete = this.#questSession.kindredQuest === "completed";
    this.physics.world.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.cameras.main.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.#createAnimations();
    this.#drawGround();

    const obstacles = this.physics.add.staticGroup();
    for (const booth of BOOTHS) {
      this.add
        .image(booth.x, booth.y, booth.texture)
        .setOrigin(0.5, 1)
        .setDisplaySize(booth.displayWidth, booth.displayHeight)
        .setDepth(booth.y);
      this.add
        .image(booth.founderX, booth.founderY, booth.founderTexture)
        .setOrigin(0.5, 1)
        .setDepth(booth.founderY);
      this.#addObstacle(
        obstacles,
        booth.x,
        booth.y - 16,
        Math.min(82, booth.displayWidth - 32),
        28,
      );
    }

    for (const [index, fire] of FIRES.entries()) {
      const tier = index === 0 && this.#questSession.kindredQuest === "sparked" ? "hot" : fire.tier;
      this.add.image(fire.x, fire.y, "fire-pit").setOrigin(0.5, 1).setScale(0.5).setDepth(fire.y);
      const fireSprite = this.add
        .sprite(fire.x, fire.y - 3, `fire-${tier}`)
        .setOrigin(0.5, 1)
        .setScale(fireScale(tier))
        .setDepth(fire.y + 1)
        .play(`fire-${tier}-loop`);
      this.#fireSprites.set(BOOTHS[index]!.id, fireSprite);
    }

    this.add
      .image(CITY_CENTER.x, CITY_CENTER.y, "fountain")
      .setOrigin(0.5, 1)
      .setDepth(CITY_CENTER.y);
    this.#addObstacle(obstacles, CITY_CENTER.x, CITY_CENTER.y - 10, 42, 22);

    for (const decoration of DECORATIONS) {
      this.add
        .image(decoration.x, decoration.y, decoration.texture)
        .setOrigin(0.5, 1)
        .setFlipX(decoration.flipX ?? false)
        .setDepth(decoration.y);
    }
    this.add
      .image(EMBER_GUIDE.x, EMBER_GUIDE.y, "ember-guide")
      .setOrigin(0.5, 1)
      .setDepth(EMBER_GUIDE.y);

    if (this.#questSession.kindredQuest !== "sparked") {
      const firstBooth = BOOTHS[0]!;
      this.add
        .text(firstBooth.x, firstBooth.y - 104, "★ FIRST QUEST", {
          color: "#ffc247",
          fontFamily: "monospace",
          fontSize: "8px",
          stroke: "#1f2420",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(firstBooth.y + 2)
        .setResolution(2);
    }

    const playerSpawn =
      this.#questSession.kindredQuest === "completed"
        ? { x: BOOTHS[0]!.interactionX, y: BOOTHS[0]!.interactionY + 18 }
        : SCOUT_SPAWN;
    this.#player = this.physics.add
      .sprite(playerSpawn.x, playerSpawn.y, "scout-walk", 0)
      .setOrigin(0.5, 1);
    this.#player.body.setSize(8, 9).setOffset(4, 22);
    this.#player.setCollideWorldBounds(true);
    this.physics.add.collider(this.#player, obstacles);
    this.cameras.main.startFollow(this.#player, true, 0.14, 0.14);
    this.cameras.main.setDeadzone(96, 64);
    this.cameras.main.setRoundPixels(true);

    const keyboard = this.input.keyboard;
    if (keyboard === null) throw new Error("Keyboard input unavailable.");
    this.#cursors = keyboard.createCursorKeys();
    this.#keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      dismiss: Phaser.Input.Keyboard.KeyCodes.ESC,
      confirm: Phaser.Input.Keyboard.KeyCodes.ENTER,
    }) as KeyMap;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.#unsubscribeBooths?.();
      this.#unsubscribeBooths = null;
      this.#input.reset();
      this.#uiBridge.publish(this.#state());
    });
    if (this.#gameplayBackend !== null) {
      this.#unsubscribeBooths = this.#gameplayBackend.subscribeBooths(
        (booths) => this.#applyRealtimeBooths(booths),
        () => undefined,
      );
    }
    this.#uiBridge.publish(this.#state());
  }

  public override update(): void {
    const uiAction = this.#input.consumeUiAction();
    const confirmPressed =
      Phaser.Input.Keyboard.JustDown(this.#keys.interact) ||
      Phaser.Input.Keyboard.JustDown(this.#keys.confirm);
    if (uiAction === "primary" || confirmPressed) {
      if (this.#advanceOverlay()) return;
    }
    if (
      uiAction === "secondary" ||
      Phaser.Input.Keyboard.JustDown(this.#keys.dismiss) ||
      this.#input.consumeDismiss()
    ) {
      if (this.#introStep === null) this.#dismiss();
      if (this.#openBooth !== null || this.#showQuestComplete) return;
    }

    const overlayOpen =
      this.#introStep !== null || this.#openBooth !== null || this.#showQuestComplete;
    const left =
      this.#cursors.left.isDown || this.#keys.left.isDown || this.#input.getDirection("left");
    const right =
      this.#cursors.right.isDown || this.#keys.right.isDown || this.#input.getDirection("right");
    const up = this.#cursors.up.isDown || this.#keys.up.isDown || this.#input.getDirection("up");
    const down =
      this.#cursors.down.isDown || this.#keys.down.isDown || this.#input.getDirection("down");
    const velocity = new Phaser.Math.Vector2(
      overlayOpen ? 0 : Number(right) - Number(left),
      overlayOpen ? 0 : Number(down) - Number(up),
    );
    if (velocity.lengthSq() > 0) velocity.normalize().scale(PLAYER_SPEED);
    this.#player.setVelocity(velocity.x, velocity.y).setDepth(this.#player.y);
    this.#animatePlayer(velocity);
    this.#updateProximity();

    if (!overlayOpen && (confirmPressed || this.#input.consumeInteract())) this.#interact();
  }

  #advanceOverlay(): boolean {
    if (this.#introStep !== null) {
      if (this.#introStep === 0) this.#introStep = 1;
      else {
        this.#introStep = null;
        this.#questSession.completeIntro();
      }
      this.#uiBridge.publish(this.#state());
      return true;
    }
    if (this.#showQuestComplete) {
      this.#showQuestComplete = false;
      this.#questSession.throwPracticeSpark();
      this.#igniteKindredFire();
      this.#uiBridge.publish(this.#state());
      return true;
    }
    if (this.#openBooth === null) return false;
    const pages = dialoguePagesFor(this.#openBooth);
    const isLastPage = this.#dialoguePage >= pages.length - 1;
    if (!isLastPage) {
      this.#dialoguePage += 1;
      this.#uiBridge.publish(this.#state());
      return true;
    }
    if (this.#openBooth.id === "kindred-labs" && this.#questSession.kindredQuest !== "sparked") {
      this.#questSession.startKindredQuest();
      this.scene.start("bug-squash");
      return true;
    }
    this.#dismiss();
    return true;
  }

  #igniteKindredFire(): void {
    const fire = this.#fireSprites.get("kindred-labs");
    if (fire === undefined) return;
    fire.setTexture("fire-hot").play("fire-hot-loop");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      this.tweens.add({
        targets: fire,
        scale: { from: 0.64, to: fireScale("hot") },
        duration: 300,
        ease: "Back.easeOut",
      });
    }
    if (this.#gameplayBackend !== null) {
      this.time.delayedCall(750, () => {
        const state = this.#boothStates.get("kindred-labs");
        if (state !== undefined) this.#applyFireState(state);
      });
    }
  }

  #applyRealtimeBooths(booths: readonly RealtimeBooth[]): void {
    for (const booth of booths) {
      this.#boothStates.set(booth.slug, booth);
      this.#applyFireState(booth);
    }
    this.#uiBridge.publish(this.#state());
  }

  #applyFireState(booth: RealtimeBooth): void {
    const fire = this.#fireSprites.get(booth.slug);
    if (fire === undefined || !fire.active) return;
    fire
      .setTexture(`fire-${booth.fireTier}`)
      .setScale(fireScale(booth.fireTier))
      .play(`fire-${booth.fireTier}-loop`);
  }

  #boothSummary(booth: BoothPlacement | null): GameUiState["nearbyBooth"] {
    if (booth === null) return null;
    const realtime = this.#boothStates.get(booth.id);
    return {
      id: booth.id,
      name: booth.name,
      founder: booth.founder,
      fireScore: realtime?.fireScore,
      fireTier: realtime?.fireTier,
    };
  }

  #drawGround(): void {
    const data = Array.from({ length: PLAZA_ROWS }, (_, row) =>
      Array.from({ length: PLAZA_COLUMNS }, (_, column) => tileFrameAt(column, row)),
    );
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage("terrain", "terrain", TILE_SIZE, TILE_SIZE, 0, 0);
    if (tileset === null) throw new Error("The city terrain tileset could not be created.");
    const layer = map.createLayer(0, tileset, 0, 0);
    if (layer === null) throw new Error("The city terrain layer could not be created.");
    layer.setDepth(0);
  }

  #createAnimations(): void {
    for (const [direction, start] of [
      ["down", 0],
      ["left", 4],
      ["right", 8],
      ["up", 12],
    ] as const) {
      const key = `scout-walk-${direction}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers("scout-walk", { start, end: start + 3 }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
    for (const tier of ["cold", "hot", "blazing"] as const) {
      const key = `fire-${tier}-loop`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(`fire-${tier}`, { start: 0, end: 5 }),
          frameRate: 8,
          repeat: -1,
        });
      }
    }
  }

  #addObstacle(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const obstacle = this.add.rectangle(x, y, width, height, 0, 0);
    group.add(obstacle);
  }

  #animatePlayer(velocity: Phaser.Math.Vector2): void {
    if (velocity.lengthSq() === 0) {
      this.#player.anims.stop();
      const idleFrame = { down: 0, left: 4, right: 8, up: 12 }[this.#facing];
      this.#player.setFrame(idleFrame);
      return;
    }
    this.#facing =
      Math.abs(velocity.x) > Math.abs(velocity.y)
        ? velocity.x < 0
          ? "left"
          : "right"
        : velocity.y < 0
          ? "up"
          : "down";
    this.#player.play(`scout-walk-${this.#facing}`, true);
  }

  #updateProximity(): void {
    let nearest: BoothPlacement | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const booth of BOOTHS) {
      const distance = Phaser.Math.Distance.Between(
        this.#player.x,
        this.#player.y,
        booth.interactionX,
        booth.interactionY,
      );
      if (distance < INTERACTION_RADIUS && distance < nearestDistance) {
        nearest = booth;
        nearestDistance = distance;
      }
    }
    if (nearest?.id !== this.#nearby?.id) {
      this.#nearby = nearest;
      this.#uiBridge.publish(this.#state());
    }
  }

  #interact(): void {
    if (this.#nearby === null) return;
    this.#openBooth = this.#nearby;
    this.#dialoguePage = 0;
    this.#questSession.discoverBooth(this.#nearby.id);
    this.#uiBridge.publish(this.#state());
  }

  #dismiss(): void {
    if (this.#openBooth === null && !this.#showQuestComplete) return;
    this.#openBooth = null;
    this.#showQuestComplete = false;
    this.#uiBridge.publish(this.#state());
  }

  #overlay(): GameOverlay {
    if (this.#introStep === 0) {
      return {
        kind: "intro",
        eyebrow: "EMBER // CITY GUIDE",
        title: "Welcome to Fire City, Scout",
        body: "Every booth holds a startup story. Help founders solve real problems, and their community fire grows.",
        primaryLabel: "How does fire work?",
      };
    }
    if (this.#introStep === 1) {
      return {
        kind: "intro",
        eyebrow: "YOUR FIRST TRAIL",
        title: "Fire is earned, never bought",
        body: "Follow the west road to Maya at Kindred Labs. Finish her Bug Squash quest to earn your first Practice Spark.",
        primaryLabel: "Start scouting",
      };
    }
    if (this.#showQuestComplete) {
      return {
        kind: "quest-complete",
        eyebrow: "QUEST COMPLETE // PRACTICE",
        title: "You earned a Practice Spark",
        body: "This local spark previews how verified community support grows a public fire. It does not affect the public score.",
        primaryLabel: "Throw Practice Spark",
        secondaryLabel: "Save it for later",
      };
    }
    if (this.#openBooth !== null) {
      if (this.#openBooth.id === "kindred-labs" && this.#questSession.kindredQuest === "sparked") {
        return {
          kind: "dialogue",
          eyebrow: "MAYA // FOUNDER",
          title: "Kindred Labs",
          body: "You cleared our release board—and the fire remembers. Thanks, Scout. Explore the other booths to discover what they’re building.",
          primaryLabel: "Keep exploring",
        };
      }
      const page = dialoguePagesFor(this.#openBooth)[this.#dialoguePage]!;
      return { kind: "dialogue", ...page, secondaryLabel: "Maybe later" };
    }
    return { kind: "none" };
  }

  #state(): GameUiState {
    return {
      nearbyBooth: this.#boothSummary(this.#nearby),
      openBooth: this.#boothSummary(this.#openBooth),
      discoveredCount: this.#questSession.discoveredCount,
      totalBooths: BOOTHS.length,
      objective:
        this.#questSession.kindredQuest === "sparked"
          ? "Explore the remaining startup booths"
          : this.#questSession.kindredQuest === "completed"
            ? "Throw your Practice Spark into Kindred Labs’ fire"
            : "First trail: Meet Maya at Kindred Labs · West road",
      overlay: this.#overlay(),
      publicFuelOffer:
        this.#questSession.kindredQuest === "sparked" && this.#nearby?.id === "kindred-labs"
          ? { boothSlug: "kindred-labs", boothName: "Kindred Labs" }
          : null,
    };
  }
}
