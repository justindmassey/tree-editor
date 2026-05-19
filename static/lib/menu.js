import { div } from "./elements.js";

export default class Menu {
  constructor(label, ...items) {
    this.items = div(...items)
      .c("menu-items")
      .e("click", () => {
        this.items.classList.add("hidden");
      });
    this.elem = div(
      div(label)
        .e("mouseenter", () => {
          this.items.classList.remove("hidden");
        })
        .c("menu-label"),
      this.items,
    ).c("menu");
  }

  addItem(item) {
    this.items.appendChild(item);
  }

  clearItems() {
    this.items.replaceChildren();
  }
}
