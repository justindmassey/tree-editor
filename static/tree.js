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
      if (data.error) {
        alert(data.error);
      } else {
        this.root = Node.deserialize(data);
        setTimeout(() => history.add(), 0);
        localStorage.setItem("tree", name);
      }
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
    typedefMenu.clearItems();
    let recursionError = false;
    this.root.traverse((n) => {
      let m = n.name.value.match(Node.typedefRegEx);
      if (m) {
        typedefs[m[1]] = n;
        typedefMenu.addItem(div(m[1]).e("click", () => n.focus()));
        n.traverse((node) => {
          let nodeTypes = node.name.value.match(Node.nodeTypeRegEx) || [];
          for (let t of nodeTypes) {
            if (t == "." + m[1]) {
              alert("Error: recursive type definition");
              recursionError = true;
              node.name.value = node.name.value.replace(t, "");
              this.updateTypes();
              return true;
            }
          }
          let listTypes = node.name.value.match(Node.listTypeRegEx) || [];
          for (let t of listTypes) {
            if (t == ":" + m[1]) {
              alert("Error: recursive type definition");
              recursionError = true;
              node.name.value = node.name.value.replace(t, "");
              this.updateTypes();
              return true;
            }
          }
        });
      }
    });
    if (Object.keys(typedefs).length && !recursionError) {
      this.root.traverse((n) => {
        if (!n.isAttribute) {
          let nodeTypes = n.name.value.match(Node.nodeTypeRegEx);
          if (nodeTypes) {
            for (let i = nodeTypes.length - 1; i >= 0; i--) {
              let t = nodeTypes[i].slice(1);
              if (typedefs[t]) {
                n.merge(typedefs[t]);
              }
            }
          }
          let listTypes = n.name.value.match(Node.listTypeRegEx);
          if (listTypes) {
            for (let i = listTypes.length - 1; i >= 0; i--) {
              let t = listTypes[i].slice(1);
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
    this.output.replaceChildren(this.root.toElement());
  }

  update() {
    this.updateTypes();
    this.updateOutput();
  }
}

export default new Tree();
