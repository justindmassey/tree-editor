import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";
import { get } from "./lib/ajax.js";
import typedefMenu from "./typedef-menu.js";

class Tree {
  constructor() {
    this.tree = div().c("tree-container");
    this.output = div().c("output", "hidden");
    this.elem = div(this.tree, this.output).c("tree");
    this.clipboard = null;
    this.root = new Node();
  }

  load(name) {
    get("/trees/" + encodeURIComponent(name)).then((data) => {
      this.root = Node.deserialize(data);
      setTimeout(() => history.add(), 0);
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

  updateTypes() {
    let typedefs = {};
    typedefMenu.menu.clearItems();
    this.root.traverse((n) => {
      let m = n.name.value.match(Node.typedefRegEx);
      if (m) {
        typedefs[m[1]] = n;
        typedefMenu.menu.addItem(div(m[2]).e("click", () => n.focus()));
      }
    });
    if (Object.keys(typedefs).length) {
      this.root.traverse((n) => {
        if (!n.isAttribute) {
          let nodeTypes = n.name.value.match(Node.nodeTypeRegEx);
          if (nodeTypes) {
            for (let i = nodeTypes.length - 1; i >= 0; i--) {
              let t = ":" + nodeTypes[i].slice(1);
              if (typedefs[t]) {
                n.merge(typedefs[t]);
              }
            }
          }
          let listTypes = n.name.value.match(Node.listTypeRegEx);
          if (listTypes) {
            for (let i = listTypes.length - 1; i >= 0; i--) {
              let t = listTypes[i];
              if (typedefs[t]) {
                for (let child of n.nonAttrChildren) {
                  child.merge(typedefs[t]);
                }
              }
            }
          }
        }
      });
    }
  }

  updateOutput() {
    if (!this.output.classList.contains("hidden")) {
      this.output.replaceChildren(this.root.toElement());
    }
  }
}

export default new Tree();
