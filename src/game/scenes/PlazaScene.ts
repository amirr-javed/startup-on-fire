import Phaser from "phaser";

import type { GameUiBridge, GameUiState } from "../events/GameUiBridge";
import type { DigitalInput } from "../input/DigitalInput";
import {
  BOOTHS,
  INTERACTION_RADIUS,
  PLAYER_SPEED,
  PLAZA_COLUMNS,
  PLAZA_HEIGHT,
  PLAZA_ROWS,
  PLAZA_WIDTH,
  TILE_SIZE,
  tileFrameAt,
  type BoothPlacement,
} from "../world/plazaLayout";

type PlazaServices = Readonly<{
  input: DigitalInput;
  uiBridge: GameUiBridge;
}>;

type KeyMap = Record<
  "up" | "down" | "left" | "right" | "interact" | "dismiss",
  Phaser.Input.Keyboard.Key
>;

export class PlazaScene extends Phaser.Scene {
  readonly #input: DigitalInput;
  readonly #uiBridge: GameUiBridge;
  readonly #discovered = new Set<string>();
  #player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  #cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  #keys!: KeyMap;
  #nearby: BoothPlacement | null = null;
  #openBooth: BoothPlacement | null = null;

  public constructor(services: PlazaServices) {
    super("plaza");
    this.#input = services.input;
    this.#uiBridge = services.uiBridge;
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.cameras.main.setBounds(0, 0, PLAZA_WIDTH, PLAZA_HEIGHT);
    this.#drawGround();

    const obstacles = this.physics.add.staticGroup();
    for (const booth of BOOTHS) {
      this.add.image(booth.x, booth.y, booth.texture).setOrigin(0.5, 1).setDepth(booth.y);
      this.add
        .image(booth.founderX, booth.founderY, booth.founderTexture)
        .setOrigin(0.5, 1)
        .setDepth(booth.founderY);
      this.#addObstacle(obstacles, booth.x, booth.y - 17, 64, 26);
    }

    this.add.image(288, 194, "fountain").setOrigin(0.5, 1).setDepth(194);
    this.#addObstacle(obstacles, 288, 182, 32, 23);
    this.#decorate();

    this.#createAnimations();
    this.#player = this.physics.add.sprite(288, 264, "scout-walk", 0).setOrigin(0.5, 1);
    this.#player.body.setSize(8, 8).setOffset(4, 23);
    this.#player.setCollideWorldBounds(true);
    this.physics.add.collider(this.#player, obstacles);
    this.cameras.main.startFollow(this.#player, true, 0.14, 0.14);
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
    }) as KeyMap;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.#input.reset();
      this.#uiBridge.publish(this.#state());
    });
    this.#uiBridge.publish(this.#state());
  }

  public override update(): void {
    const left =
      this.#cursors.left.isDown || this.#keys.left.isDown || this.#input.getDirection("left");
    const right =
      this.#cursors.right.isDown || this.#keys.right.isDown || this.#input.getDirection("right");
    const up = this.#cursors.up.isDown || this.#keys.up.isDown || this.#input.getDirection("up");
    const down =
      this.#cursors.down.isDown || this.#keys.down.isDown || this.#input.getDirection("down");
    const velocity = new Phaser.Math.Vector2(
      Number(right) - Number(left),
      Number(down) - Number(up),
    );
    if (velocity.lengthSq() > 0) velocity.normalize().scale(PLAYER_SPEED);
    this.#player.setVelocity(velocity.x, velocity.y).setDepth(this.#player.y);
    this.#animatePlayer(velocity);
    this.#updateProximity();

    if (Phaser.Input.Keyboard.JustDown(this.#keys.interact) || this.#input.consumeInteract())
      this.#interact();
    if (Phaser.Input.Keyboard.JustDown(this.#keys.dismiss) || this.#input.consumeDismiss())
      this.#dismiss();
  }

  #drawGround(): void {
    for (let row = 0; row < PLAZA_ROWS; row += 1) {
      for (let column = 0; column < PLAZA_COLUMNS; column += 1) {
        this.add
          .image(column * TILE_SIZE, row * TILE_SIZE, "terrain", tileFrameAt(column, row))
          .setOrigin(0)
          .setDepth(0);
      }
    }
  }

  #decorate(): void {
    const props = [
      ["tree", 30, 330],
      ["tree", 546, 330],
      ["shrub", 184, 76],
      ["shrub", 392, 76],
      ["bench", 218, 210],
      ["bench", 358, 210],
      ["lamp", 208, 152],
      ["lamp", 368, 152],
      ["sign", 48, 176],
    ] as const;
    for (const [texture, x, y] of props)
      this.add.image(x, y, texture).setOrigin(0.5, 1).setDepth(y);
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

  #createAnimations(): void {
    const rows = ["down", "left", "right", "up"] as const;
    for (let row = 0; row < rows.length; row += 1) {
      this.anims.create({
        key: `scout-${rows[row]}`,
        frames: this.anims.generateFrameNumbers("scout-walk", { start: row * 4, end: row * 4 + 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  #animatePlayer(velocity: Phaser.Math.Vector2): void {
    if (velocity.lengthSq() === 0) {
      this.#player.anims.stop();
      return;
    }
    const direction =
      Math.abs(velocity.x) > Math.abs(velocity.y)
        ? velocity.x < 0
          ? "left"
          : "right"
        : velocity.y < 0
          ? "up"
          : "down";
    this.#player.anims.play(`scout-${direction}`, true);
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
      if (nearest === null) this.#openBooth = null;
      this.#uiBridge.publish(this.#state());
    }
  }

  #interact(): void {
    if (this.#nearby === null) return;
    this.#openBooth = this.#nearby;
    this.#discovered.add(this.#nearby.id);
    this.#uiBridge.publish(this.#state());
  }

  #dismiss(): void {
    if (this.#openBooth === null) return;
    this.#openBooth = null;
    this.#uiBridge.publish(this.#state());
  }

  #state(): GameUiState {
    return {
      nearbyBooth: this.#nearby,
      openBooth: this.#openBooth,
      discoveredCount: this.#discovered.size,
      totalBooths: BOOTHS.length,
    };
  }
}
