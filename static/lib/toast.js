import { div } from "./elements.js";

export default class Toast {
  constructor() {
    this.message = div().c("toast-message");
    this.elem = div(this.message).c("toast");
    this.elem.inert = true;
  }

  pop(message = "") {
    this.message.textContent = message;
    this.elem.classList.remove("pop");
    this.elem.offsetWidth;
    this.elem.classList.add("pop");
  }
}