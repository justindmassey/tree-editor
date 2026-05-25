import { div } from "./elements.js";

export default class Menu {
  constructor(label, ...items) {
    this.open = false;
    this.items = div(...items)
      .c("menu-items")
      .e("click", () => {
        this.items.classList.add("hidden");
      });
    this.elem = div(
      div(label)
        .e("click", (ev) => {
          this.items.classList.toggle("hidden");
          ev.stopPropagation();
        })
        .c("menu-label"),
      this.items,
    )
      .c("menu")
      .e("mouseenter", () => {
        this.items.classList.remove("hidden");
        this.open = true;
      })
      .e("mouseleave", () => {
        this.open = false;
      });
  }

  addItem(item) {
    this.items.appendChild(item);
  }

  clearItems() {
    this.items.replaceChildren();
  }
  static inactiveItem(title) {
    return div(title)
      .c("inactive-item")
      .e("click", (ev) => ev.stopPropagation());
  }
}
