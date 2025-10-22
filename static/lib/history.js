export default class History {
  constructor(onchange, maxLength = 100) {
    this.maxLength = maxLength;
    this.onchange = onchange;
    this.history = [];
    this.index = -1;
  }

  add(skipOnChange) {
    this.index++;
    this.history = this.history.slice(-this.maxLength, this.index);
    this.history.push(this.serialize());
    if (this.onchange && !skipOnChange) {
      this.onchange(this);
    }
  }

  undo() {
    if (this.index > 0) {
      this.index--;
      this.deserialize(this.history[this.index]);
      if (this.onchange) {
        this.onchange(this);
      }
    }
  }

  redo() {
    if (this.index < this.history.length - 1) {
      this.index++;
      this.deserialize(this.history[this.index]);
      if (this.onchange) {
        this.onchange(this);
      }
    }
  }
}
