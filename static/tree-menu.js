import Menu from "./lib/menu.js";
import {div} from "./lib/elements.js";
import {get} from "./lib/ajax.js";
import Node from "./node.js";
import tree from "./tree.js";
import history from "./history.js";
import loadTree from "./load-tree.js";

class TreeMenu {
  constructor() {
    this.menu = new Menu(div("Trees"));
    this.elem = this.menu.elem;
    this.update()
  }

  update() {
    this.menu.clearItems()
    get('/list').then((list) => {
      for(let treeName of list) {
	this.menu.addItem(div(treeName).e("click", () => loadTree(treeName)));
      }
    })
  }
}

export default new TreeMenu()
