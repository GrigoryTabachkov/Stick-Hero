cc.Class({
  extends: cc.Component,

  properties: {
    zIndex: {
      default: 1,
    },
  },

  onLoad() {
    this.node.zIndex = this.zIndex;
  },

});
