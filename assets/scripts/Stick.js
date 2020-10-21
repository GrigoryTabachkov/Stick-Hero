const {
  Class, Component,
} = cc;

Class({
  extends: Component,

  properties: {
    zIndex: {
      default: 2,
    },
  },

  onLoad() {
    this.node.zIndex = this.zIndex;
  },

  // ----------------------------------------------------
  // stick methods --------------------------------------
  // at hero logic
  // ----------------------------------------------------
  // ----------------------------------------------------
});
