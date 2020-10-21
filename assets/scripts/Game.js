import Hero from './Hero';

const {
  Component, Prefab, Class,
  instantiate, v2, Node,
  Label, AudioClip, audioEngine,
  director, tween, systemEvent, SystemEvent,
  Canvas,
} = cc;

Class({
  extends: Component,

  properties: {
    btnNode: {
      default: null,
      type: Node,
    },

    hero: {
      default: null,
      type: Hero,
    },

    startPlatform: {
      default: null,
      type: Node,
    },

    platformPrefab: {
      default: null,
      type: Prefab,
    },

    scoreDisplay: {
      default: null,
      type: Label,
    },

    gameOverNode: {
      default: null,
      type: Node,
    },

    gameSoundTrack: {
      default: null,
      type: AudioClip,
    },

    scoreSound: {
      default: null,
      type: AudioClip,
    },

    scoreFive: {
      default: null,
      type: AudioClip,
    },
  },

  newPlatPos() {
    const randomX = Math.floor(Math.random() * (667 + 1) - 256);
    const exactY = this.startPlatform.y + this.startPlatform.height / 2;
    return v2(randomX, exactY);
  },

  createPlat() {
    const newPlat = instantiate(this.platformPrefab);
    this.node.addChild(newPlat, 0);
    newPlat.setPosition(this.newPlatPos());
    newPlat.width = Math.floor(Math.random() * (this.startPlatform.width - 64 + 1) + 64);
    newPlat.getComponent('Platform').game = this;
  },

  onLoad() {
    this.enabled = false;
    this.score = 0;
    audioEngine.setMusicVolume(0.5);
  },

  onStartGame() {
    this.gameOverNode.active = false;
    this.enabled = true;
    this.hero.enabled = true;
    this.btnNode.x = 3000;
    audioEngine.playMusic(this.gameSoundTrack, true);
    this.createPlat();
  },

  scoreAchieve() {
    this.score += 1;
    switch (true) {
      case this.score === 3:
        this.scoreDisplay.string = `Nice, Score: ${this.score}`;
        break;
      case this.score === 5:
        audioEngine.play(this.scoreFive, false, 1);
        this.scoreDisplay.string = `Not bad for mortal, keep going! Score: ${this.score}`;
        break;
      case this.score >= 7:
        this.scoreDisplay.string = `IMMMMMORTAL: ${this.score} !!!`;
        break;
      default:
        this.scoreDisplay.string = `Score: ${this.score}`;
        break;
    }
    audioEngine.play(this.scoreSound, false, 1);
  },

  update() {
    if (this.hero.dead) {
      this.gameOver();
      this.enabled = false;
    }
  },

  gameOver() {
    tween(this.node)
      .call(() => { audioEngine.stopMusic(); })
      .call(() => { this.gameOverNode.active = true; })
      .call(() => { this.scoreDisplay.string = `Score: ${this.score} ! Try again, fellow!`; })
      .call(() => { this.hero.enabled = false; })
      .call(() => { this.hero.stopAllActs(); })
      .delay(3)
      .call(() => {
        this.btnNode.x = 0;
        director.loadScene('game');
      })
      .start();
  },
});
