import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";
import { get } from "./lib/ajax.js";
import typedefMenu from "./typedef-menu.js";

const minNameSize = 40;
const maxNameSize = 80;

class Tree {
  constructor() {
    this.tree = div().c("tree-container");
    this.output = div().c("output", "hidden");
    window.addEventListener("keydown", (ev) => {
      if (ev.key == "Control") {
        this.output.style.cursor = "default";
      }
    });
    window.addEventListener("keyup", (ev) => (this.output.style.cursor = ""));
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
        this.tree.scrollTop = 0;
        this.output.scrollTop = 0;
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
    let typedefDeps = {};
    typedefMenu.clearItems();
    this.root.traverse((n) => {
      let m = n.name.value.match(Node.typedefRegEx);
      if (m) {
        typedefs[m[1]] = n;
        typedefDeps[m[1]] = typedefDeps[m[1]] || new Set();
        typedefMenu.addItem(div(m[1]).e("click", () => n.focus()));
        n.traverse((n2) => {
          let nodeTypes = n2.name.value.match(Node.nodeTypeRegEx);
          if (nodeTypes) {
            for (let t of nodeTypes) {
              typedefDeps[m[1]].add(t.slice(1));
            }
          }
          let listTypes = n2.name.value.match(Node.listTypeRegEx);
          if (listTypes) {
            for (let t of listTypes) {
              typedefDeps[m[1]].add(t.slice(1));
            }
          }
        });
      }
    });

    let tempMark = {};
    let permMark = {};
    let cyclePath = null;

    const visit = (name, stack) => {
      if (permMark[name]) return false;
      if (tempMark[name]) {
        cyclePath = stack.concat(name);
        return name;
      }
      tempMark[name] = true;
      stack.push(name);

      let deps = typedefDeps[name];
      if (deps) {
        for (let dep of deps) {
          if (typedefDeps[dep]) {
            let t;
            if ((t = visit(dep, stack))) return t;
          }
        }
      }

      stack.pop();
      permMark[name] = true;
      return false;
    };

    for (let name in typedefDeps) {
      let t;
      if ((t = visit(name, []))) {
        alert("Error: Recursive type definitions: " + cyclePath.join(" -> "));
        if ("value" in document.activeElement) {
          let prevName = document.activeElement.value;
          document.activeElement.value = document.activeElement.value
            .replace(new RegExp("(?<!\\\\)" + regex("." + t), "g"), "")
            .replace(new RegExp("(?<!:|\\\\)" + regex(":" + t), "g"), "");
          if (prevName != document.activeElement.value) {
            this.updateTypes();
          }
        }
        return;
      }
    }

    if (Object.keys(typedefs).length) {
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
    if (
      this.root.name.value.startsWith("#") ||
      this.root.name.value.match(Node.typedefRegEx) ||
      this.root.name.value.match(Node.attrRegEx)
    ) {
      this.output.replaceChildren();
    } else {
      this.output.replaceChildren(this.root.widget);
    }
  }

  updateNameSize() {
    let longestName = 0;
    this.root.traverse((n) => {
      if (n.name.value.length > longestName) {
        if (n.name.value.length <= maxNameSize) {
          longestName = n.name.value.length;
        } else {
          longestName = maxNameSize;
          return true;
        }
      }
    });
    if (longestName > minNameSize) {
      this.root.traverse((n) => {
        n.name.size = longestName;
      });
    } else {
      this.root.traverse((n) => {
        n.name.size = minNameSize;
      });
    }
  }

  update() {
    this.updateTypes();
    this.updateOutput();
    this.updateNameSize();
  }
}

function regex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default new Tree();
