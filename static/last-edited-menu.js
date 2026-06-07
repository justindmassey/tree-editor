import Menu from "./lib/menu.js";
import tree from "./tree.js";
import { div } from "./lib/elements.js";

class LastEditedMenu {
  constructor() {
    this.menu = new Menu("Last Edited");
    this.elem = this.menu.elem;
    this.elem.e("mouseenter", () => this.update());
  }

  update() {
    this.menu.clearItems();
    let nodes = [];
    tree.root.traverse((node) => {
      nodes.push(node);
    });
    for (let node of nodes.toSorted(
      (a, b) => b.lastModified - a.lastModified,
    )) {
      this.menu.addItem(
        div(node.nameValue || " ")
          .c("tt")
          .a("title", node.name.title)
          .e("click", () => node.focus(true)),
      );
    }
  }
}

export default new LastEditedMenu();
