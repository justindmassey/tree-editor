import { div } from "./elements.js";

export default class Menu {
  constructor(label, ...items) {
    this.items = div(...items).c("menu-items");
    this.elem = div(div(label).c("menu-label"), this.items).c("menu");
  }

  addItem(item) {
    this.items.appendChild(item);
  }

  clearItems() {
    this.items.replaceChildren()
  }
}