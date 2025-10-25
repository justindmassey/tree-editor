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
      let m = n.name.value.match(/^:(:(\S+))/);
      if (m) {
        typedefs[m[1]] = n;
        typedefMenu.menu.addItem(div(m[2]).e("click", () => n.focus()));
      }
    });
    this.root.traverse((n) => {
      if (!n.isAttribute) {
        let types = n.name.value.match(Node.typeRegEx);
        if (types) {
          for (let t of types) {
            if (typedefs[t]) {
              for (let child of n.nonAttrChildren) {
                for (let prop of typedefs[t].children.children) {
                  child.merge(typedefs[t]);
                }
              }
            }
          }
        }
      }
    });
  }

  updateOutput() {
    if (!this.output.classList.contains("hidden")) {
      this.output.replaceChildren(this.root.toElement());
    }
  }
}

export default new Tree();
