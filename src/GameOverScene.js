import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("game-over-scene");
  }

  preload() {
    this.load.image(
      "gameOverSceneBackground",
      "./assets/gameoverbackground.png"
    );
    this.load.image("playagainbutton", "./assets/playagainbutton.png");
  }
  create() {
    this.gameOverSceneBackgroundImage = this.add.sprite(
      400,
      300,
      "gameOverSceneBackground"
    );
    this.playButton = this.add.sprite(400, 500, "playagainbutton");
    this.playButton.setInteractive({ useHandCursor: true });
    this.playButton.on("pointerdown", () => this.buttonClicked());
  }

  buttonClicked() {
    this.scene.switch("game-scene");
  }
}
