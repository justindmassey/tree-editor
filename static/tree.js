import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";
import { get } from "./lib/ajax.js";

class Tree {
  constructor() {
    this.tree = div();
    this.output = div().c("output", "hidden");
    this.elem = div(this.tree, this.output).c("tree");
    this.clipboard = null;
    this.root = new Node()
  }

  load(name) {
    get("/trees/" + encodeURIComponent(name)).then((data) => {
      this.root = Node.deserialize(data);
      history.add();
      localStorage.setItem("tree", name);
    });
  }

  set root(node) {
    this.tree.replaceChildren(node.elem);
  }

  get root() {
    if (this.tree.firstChild) {
      return this.tree.firstChild.node;
    }
  }

  updateOutput() {
    if (!this.output.classList.contains("hidden")) {
      this.output.replaceChildren(this.root.toElement());
    }
  }
}

export default new Tree();
