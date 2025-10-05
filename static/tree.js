import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";

class Tree {
  constructor() {
    this.tree = div()
    this.output = div().c("output")
    this.elem = div(
      this.tree,
      this.output
    ).c("tree")
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
    this.tree.replaceChildren(node.elem)
  }

  get root() {
    if (this.tree.firstChild) {
      return this.tree.firstChild.node;
    }
  }
}

export default new Tree();
