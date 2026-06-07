import Menu from "./lib/menu.js";
import tree from "./tree.js";
import Node from "./node.js";
import { div } from "./lib/elements.js";

class TypedefMenu {
  constructor() {
    this.menu = new Menu("Types");
    this.elem = this.menu.elem;
    this.elem.e("mouseenter", () => this.update());
  }

  update() {
    this.menu.clearItems();
    let typedefs = new Map();
    tree.root.traverse((node) => {
      if (!node.isAttribute) {
        let m = node.nameValue.match(Node.typedefRegEx);
        if (m) {
          typedefs.delete(m[1]);
          typedefs.set(m[1], node);
        }
      }
    });
    for (let [type, node] of typedefs) {
      this.menu.addItem(
        div(type)
          .a("title", node.nameValue)
          .e("click", () => node.focus(true)),
      );
    }
    if (!this.menu.items.children.length) {
      this.menu.addItem(Menu.inactiveItem("No types defined"));
    }
  }
}

export default new TypedefMenu();
