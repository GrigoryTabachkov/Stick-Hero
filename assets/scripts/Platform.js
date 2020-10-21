const {
  Class, Component, tween,
  v2, find, audioEngine, AudioClip,
} = cc;

Class({
  extends: Component,

  properties: {
    shiftPlatSound: {
      default: null,
      type: AudioClip,
    },
  },

  platformHandler() {
    const exactX = Math.floor(
      this.game.startPlatform.x
      + this.game.startPlatform.height / 2
      - this.node.width / 2,
    );
    const exactY = this.game.startPlatform.y + this.game.startPlatform.height / 2;
    tween(this.node)
      .to(0.3, {
        position: v2(exactX, exactY),
      })
      .call(() => { audioEngine.play(this.shiftPlatSound, false, 1); })
      .delay(0.1)
      .call(() => { this.node.destroy(); })
      .call(() => { this.game.createPlat(); })
      .start();
  },

  scoreCheck() {
    const newPl = find('Canvas/platform');
    const { wayPoint } = this.game.hero;
    if (wayPoint > (newPl.position.x - newPl.width / 2)
      && wayPoint < (newPl.position.x + newPl.width / 2)) {
      this.game.scoreAchieve();
    }
  },

  update() {
    if (this.game.hero.runs) {
      this.game.hero.runs = false;
      this.scoreCheck();
      this.platformHandler();
    }
  },
});
