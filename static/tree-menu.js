import Menu from "./lib/menu.js";
import { div } from "./lib/elements.js";
import { get } from "./lib/ajax.js";
import tree from "./tree.js";

class TreeMenu {
  constructor() {
    this.menu = new Menu("Trees");
    this.elem = this.menu.elem;
    this.update();
  }

  update() {
    this.menu.clearItems();
    get("/list").then((list) => {
      if (list.error) {
        alert(list.error);
      } else {
        for (let treeName of list) {
          this.menu.addItem(
            div(treeName).e("click", () => tree.load(treeName))
          );
        }
      }
    });
  }
}

export default new TreeMenu();
