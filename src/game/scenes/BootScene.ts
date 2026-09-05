import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  public constructor() {
    super("boot");
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#356b3f");

    this.add
      .text(240, 126, "STARTUP ON FIRE", {
        color: "#fff3cf",
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(240, 150, "Foundation online", {
        color: "#ffc247",
        fontFamily: "monospace",
        fontSize: "10px",
      })
      .setOrigin(0.5);
  }
}
