export default class History {
  constructor(onchange, maxLength = 100) {
    this.maxLength = maxLength;
    this.onchange = onchange;
    this.history = [];
    this.index = -1;
  }

  add(...onchangeArgs) {
    if (this.onchange) {
      this.onchange(...onchangeArgs);
    }
    this.index++;
    this.history = this.history.slice(-this.maxLength, this.index);
    this.index = Math.min(this.index, this.maxLength);
    this.history.push(this.serialize());
  }

  undo(...onchangeArgs) {
    if (this.index > 0) {
      this.index--;
      this.deserialize(this.history[this.index]);
      if (this.onchange) {
        this.onchange(...onchangeArgs);
      }
    }
  }

  redo(...onchangeArgs) {
    if (this.index < this.history.length - 1) {
      this.index++;
      this.deserialize(this.history[this.index]);
      if (this.onchange) {
        this.onchange(...onchangeArgs);
      }
    }
  }
}
