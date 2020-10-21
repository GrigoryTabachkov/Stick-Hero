import StartPlatform from './StartPlatform';
import Stick from './Stick';

const {
  Component, Class, tween,
  macro, moveBy, v2,
  easeCubicActionOut, easeCubicActionIn, scaleTo,
  repeatForever, sequence,
  systemEvent, SystemEvent,
  find, winSize, AudioClip,
  audioEngine, Canvas,
} = cc;

Class({
  extends: Component,

  properties: {
    jumpHeight: 0,
    jumpDuration: 0,
    squashDuration: 0,
    reSpawnPoint: v2(-545, -120),
    wayPoint: 0,
    extraLength: 10,

    startPlatform: {
      default: null,
      type: StartPlatform,
    },

    stick: {
      default: null,
      type: Stick,
    },

    stickSound: {
      default: null,
      type: AudioClip,
    },

    runSound: {
      default: null,
      type: AudioClip,
    },

    gameOverSound: {
      default: null,
      type: AudioClip,
    },
  },

  // ----------------------------------------------------
  // HERO life-cycle methods:----------------------------

  heroRun(wayPoint) {
    const exactY = this.startPlatform.node.y + this.startPlatform.node.height;
    tween(this.node)
      .to(0.5, {
        position: v2(wayPoint, exactY),
      })
      .call(() => { this.runs = true; })
      .start();
  },

  heroPlatShift() {
    const { y } = this.startPlatform.node;
    tween(this.startPlatform.node)
      .to(0.3, { position: v2(-923, y) })
      .to(0, { position: v2(-750, y) })
      .start();
  },

  heroDead() {
    tween(this.node)
      .call(() => { audioEngine.play(this.gameOverSound, false, 0.5); })
      .call(() => { this.runs = false; })
      .by(0.5, { position: v2(66, -666) })
      .delay(0.1)
      .call(() => { this.dead = true; })
      .start();
  },

  heroRes() {
    tween(this.node)
      .to(0.3, { position: this.reSpawnPoint })
      .call(() => { this.controlsOn(); })
      .start();
  },

  // ----------------------------------------------------
  // HERO default behavior:----------------------------

  heroJumpDefault() {
    const jumpUp = moveBy(this.jumpDuration, v2(0, this.jumpHeight)).easing(easeCubicActionOut());
    const jumpDown = moveBy(this.jumpDuration, v2(0, -this.jumpHeight)).easing(easeCubicActionIn());
    const squash = scaleTo(this.squashDuration, 1, 0.96);
    const stretch = scaleTo(this.squashDuration, 1, 1.02);
    const scaleBack = scaleTo(this.squashDuration, 1, 1);
    return repeatForever(sequence(squash, stretch, jumpUp, scaleBack, jumpDown));
  },

  // ----------------------------------------------------
  // STICK life-cycle methods: --------------------------

  stickLengthen() {
    this.stick.node.height += this.extraLength;
    audioEngine.play(this.runSound, false, 1);
  },

  stickRun() {
    // TODO
    // by duration of fall calculates by stick.length from 0.3 to 2
    tween(this.stick.node)
      .call(() => { this.controlsOff(); })
      .call(() => { audioEngine.play(this.stickSound, false, 1); })
      .by(1, {
        angle: -810,
      })
      .call(() => { audioEngine.play(this.runSound, false, 1); })
      .call(() => {
        this.heroRun(this.wayPoint);
      })
      .delay(0.5)
      .call(() => {
        this.controller();
      })
      .start();
  },

  stickFalls() {
    tween(this.stick.node)
      .by(1.5, {
        angle: -810,
        position: v2(10, -666),
      })
      .start();
  },

  stickReload() {
    tween(this.stick.node)
      .to(0.2, {
        height: 0,
      })
      .to(0, {
        angle: 0,
      })
      .start();
  },

  // ----------------------------------------------------
  // KEY Controls. press 'W' to play --------------------

  onKeyDown(event) {
    switch (event.keyCode) {
      case macro.KEY.w:
        this.accumulate = true;
        break;
      default:
        break;
    }
  },

  onKeyUp(event) {
    switch (event.keyCode) {
      case macro.KEY.w:
        systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        Canvas.instance.node.off('touchstart', this.onTouchStart, this);
        this.accumulate = false;
        this.wayPoint = Math.floor(this.stick.node.height + this.stick.node.x);
        this.stickRun();
        break;
      default:
        break;
    }
  },

  // ----------------------------------------------------
  // Mobile touch actions -------------------------------

  onTouchStart(event) {
    const touchLoc = event.getLocation();
    if (touchLoc.x <= winSize.width) {
      this.accumulate = true;
    }
    return true;
  },

  onTouchEnd() {
    Canvas.instance.node.off('touchend', this.onTouchStart, this);
    this.accumulate = false;
    this.wayPoint = Math.floor(this.stick.node.height + this.stick.node.x);
    this.stickRun();
  },

  controller() {
    // TODO:
    // add validation to stay alive on the start plat if the stick is too short
    const newPl = find('Canvas/platform');
    if (this.wayPoint > (newPl.position.x - newPl.width / 2)
      && this.wayPoint < (newPl.position.x + newPl.width / 2)) {
      this.heroRes();
      this.stickReload();
      this.heroPlatShift();
    } else {
      this.stickFalls();
      this.heroDead();
    }
  },

  stopAllActs() {
    this.node.stopAllActions();
  },

  controlsOn() {
    systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    Canvas.instance.node.on('touchstart', this.onTouchStart, this);
    Canvas.instance.node.on('touchend', this.onTouchEnd, this);
  },

  controlsOff() {
    systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    systemEvent.off(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    Canvas.instance.node.off('touchstart', this.onTouchStart, this);
    Canvas.instance.node.off('touchend', this.onTouchEnd, this);
  },

  onLoad() {
    this.node.enabled = false;
    this.accumulate = false;
    this.node.runAction(this.heroJumpDefault());
  },

  onDestroy() {
    systemEvent.off(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    systemEvent.off(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

    Canvas.instance.node.off('touchstart', this.onTouchStart, this);
    Canvas.instance.node.off('touchend', this.onTouchEnd, this);
  },

  update() {
    if (this.accumulate) this.stickLengthen();
  },
});
