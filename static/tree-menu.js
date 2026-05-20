import Menu from "./lib/menu.js";
import { div } from "./lib/elements.js";
import { get } from "./lib/ajax.js";
import tree from "./tree.js";

class TreeMenu {
  constructor() {
    this.menu = new Menu("Trees");
    this.elem = this.menu.elem;
    this.trees = [];
    this.update();
  }

  update() {
    get("/list").then((list) => {
      if (list.error) {
        alert(list.error);
      } else {
        this.menu.clearItems();
        this.trees = list;
        if (list.length) {
          for (let treeName of list) {
            this.menu.addItem(
              div(treeName || " ").e("click", () => tree.load(treeName)),
            );
          }
        } else {
          this.menu.addItem(Menu.inactiveItem("No trees saved"));
        }
      }
    });
  }
}

export default new TreeMenu();
