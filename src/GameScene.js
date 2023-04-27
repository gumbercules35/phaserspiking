import Phaser from "phaser";
import ScoreLabel from "./ui/ScoreLabel";
import BombSpawner from "./BombSpawner";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  setDoc,
} from "@firebase/firestore";
import { firestore } from "./firebase";

const scoreRef = collection(firestore, "scores");
const highScores = [];
// const q = query(scoreRef, where("score", "==", 30));
const q = query(scoreRef, orderBy("score", "desc"), limit(10));
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  // doc.data() is never undefined for query doc snapshots
  highScores.push(doc.data());
});
console.log(highScores);
const GROUND_KEY = "ground";
const DUDE_KEY = "dude";
const STAR_KEY = "star";
const BOMB_KEY = "bomb";

export default class GameScene extends Phaser.Scene {
  constructor(scene = "game-scene") {
    super(scene);

    this.gameOverText = null;
    this.gameOverTextStyle = {
      font: "65px Arial",
      fill: "#ffffff",
      align: "center",
    };
    this.player = undefined;
    this.cursors = undefined;
    this.scoreLabel = undefined;
    this.stars = undefined;
    this.bombSpawner = undefined;
    this.gameOver = false;
  }
  preload() {
    //Preload Sprites Images
    this.load.image("sky", "/assets/sky.png");
    this.load.image(GROUND_KEY, "/assets/platform.png");
    this.load.image("star", "/assets/star.png");
    this.load.image("bomb", "/assets/bomb.png");
    this.load.image(STAR_KEY, "/assets/star.png");
    this.load.image(BOMB_KEY, "assets/bomb.png");

    this.load.spritesheet(DUDE_KEY, "/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  //Sets up the Actual Game
  create() {
    this.add.image(400, 300, "sky");

    const platforms = this.createPlatforms();
    this.stars = this.createStars();
    this.player = this.createPlayer();
    this.scoreLabel = this.createScoreLabel(16, 16, 0);
    this.bombSpawner = new BombSpawner(this, BOMB_KEY);

    const bombsGroup = this.bombSpawner.group;

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.stars, platforms);
    this.physics.add.collider(bombsGroup, platforms);
    this.physics.add.collider(
      this.player,
      bombsGroup,
      this.hitBomb,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.gameOver) {
      this.scene.switch("game-over-scene");
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play("turn");

    this.submitScore(this.scoreLabel.score);

    this.createHighScores(highScores);
    this.gameOverText = this.add
      .text(400, 300, "Game Over :)", this.gameOverTextStyle)
      .setOrigin(0.5);

    this.gameOverText.setInteractive({ useHandCursor: true });
    this.gameOverText.on("pointerdown", () => this.scene.start());

    //this.gameOver = true;
  }

  createPlayer() {
    const player = this.physics.add.sprite(400, 450, DUDE_KEY);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: DUDE_KEY, frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    return player;
  }
  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);
    this.add.existing(label);
    return label;
  }
  createHighScores(scores) {
    const style = { fontSize: "32px", fill: "#000" };

    scores.forEach(({ score }, index) => {
      const label = new ScoreLabel(this, 100, 50 + 20 * index, score, style);
      this.add.existing(label);
    });
  }
  createStars() {
    const stars = this.physics.add.group({
      key: STAR_KEY,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    return stars;
  }
  createPlatforms() {
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, GROUND_KEY).setScale(10, 2).refreshBody();

    platforms.create(600, 400, GROUND_KEY);
    platforms.create(50, 250, GROUND_KEY);
    platforms.create(750, 220, GROUND_KEY);

    return platforms;
  }
  collectStar(player, star) {
    star.disableBody(true, true);

    this.scoreLabel.add(10);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect
      this.stars.children.iterate((child) => {
        child.enableBody(true, child.x, 0, true, true);
      });
    }

    this.bombSpawner.spawn(player.x);
  }

  submitScore(score) {
    const ref = collection(firestore, "scores");
    let data = {
      score: score,
    };

    try {
      addDoc(ref, data);
    } catch (error) {
      console.log(error);
    }
  }
}
