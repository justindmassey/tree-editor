import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";

class Tree {
  constructor() {
    this.elem = div().c("tree");
    this.clipboard = null;
    this.load()
  }

  load() {
    if (localStorage.getItem("tree")) {
      this.root = Node.deserialize(JSON.parse(localStorage.getItem("tree")));
    } else {
      this.root = new Node("Alt+h for help");
      setTimeout(() => this.root.focus(), 0);
    }
    setTimeout(() => history.add(), 0);
  }

  set root(node) {
    this.elem.replaceChildren(node.elem)
  }

  get root() {
    if (this.elem.firstChild) {
      return this.elem.firstChild.node;
    }
  }
}

export default new Tree();
