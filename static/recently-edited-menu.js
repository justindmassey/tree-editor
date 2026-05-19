import Menu from "./lib/menu.js";
import tree from "./tree.js";
import { div } from "./lib/elements.js";

class RecentlyEditedMenu {
  constructor() {
    this.menu = new Menu("Recently Edited");
    this.elem = this.menu.elem;
    this.elem.e("mouseenter", () => this.update());
  }

  update() {
    this.menu.clearItems();
    let nodes = [];
    tree.root.traverse((node) => {
      nodes.push(node);
    });
    console.log(nodes);
    for (let node of nodes
      .toSorted((a, b) => b.lastModified - a.lastModified)
      .slice(0, 16)) {
      this.menu.addItem(
        div(node.nameValue || " ")
          .c("tt")
          .a("title", "Last edited: " + node.lastModified.toLocaleString())
          .e("click", () => node.focus()),
      );
    }
  }
}

export default new RecentlyEditedMenu();
