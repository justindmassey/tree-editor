import Node from "./node.js";
import { div, span } from "./lib/elements.js";
import history from "./history.js";
import { get } from "./lib/ajax.js";
import Toast from "./lib/toast.js";
import nodeCommands from "./node-commands.js";
import typedefMenu from "./typedef-menu.js";
import lastEditedMenu from "./last-edited-menu.js";
import { styleText } from "./widgets.js";

class Tree {
  constructor() {
    let wheelNodeMovement = localStorage.getItem("wheelNodeMovement");
    if (wheelNodeMovement == null) {
      this.wheelNodeMovement = true;
    } else {
      this.wheelNodeMovement = wheelNodeMovement;
    }

    this.tree = div()
      .c("tree-container")
      .e("wheel", (ev) => {
        if (
          this.wheelNodeMovement &&
          ev.shiftKey &&
          this.activeNode &&
          document.activeElement == this.activeNode.name
        ) {
          ev.preventDefault();
          if (ev.altKey) {
            if (ev.deltaY < 0) {
              nodeCommands["Alt+Shift+ArrowUp"].action.bind(this.activeNode)();
            } else if (ev.deltaY > 0) {
              nodeCommands["Alt+Shift+ArrowDown"].action.bind(
                this.activeNode,
              )();
            }
          } else {
            if (ev.deltaY < 0) {
              nodeCommands["Alt+ArrowUp, Alt+Shift+P"].action.bind(
                this.activeNode,
              )();
            } else if (ev.deltaY > 0) {
              nodeCommands["Alt+ArrowDown, Alt+Shift+N"].action.bind(
                this.activeNode,
              )();
            }
          }
        }
      });
    this.output = div().c("output", "hidden");
    this.errorPath = span();
    this.error = div("Recursive type: ", this.errorPath).c("error", "hidden");
    this.toast = new Toast();
    this.elem = div(this.tree, this.output, this.error, this.toast).c("tree");

    this.root = new Node();
    this.pasteMode = "replace";

    window.addEventListener("keydown", (ev) => {
      if (ev.key == "Control") {
        this.elem.classList.add("default-cursor");
      }
    });

    window.addEventListener("keyup", (ev) =>
      this.elem.classList.remove("default-cursor"),
    );
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("autosave", JSON.stringify(this.root.serialize()));
    });
  }

  load(name, escapedName = name) {
    get("/tree?name=" + encodeURIComponent(name)).then((data) => {
      if (data.error) {
        this.root = new Node(escapedName);
        this.root.focus();
        this.scrollToTop();
        history.clear();
        history.add();
      } else {
        this.root = Node.deserialize(data);
        this.root.focus();
        this.scrollToTop();
        history.clear();
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

  scrollToTop() {
    this.tree.scrollTop = 0;
    this.output.scrollTop = 0;
  }

  get name() {
    if ("$name" in this.root.attributes) {
      return this.root._attributes.$name;
    } else {
      return this.root.nameText;
    }
  }

  updateTypes() {
    let typedefs = {};
    let typedefDeps = {};
    this.root.traverse((n) => {
      if (!n.isAttribute) {
        let m = n.nameValue.match(Node.typedefRegEx);
        if (m) {
          typedefs[m[1]] = n;
          typedefDeps[m[1]] = typedefDeps[m[1]] || new Set();

          n.traverse((n2) => {
            let nodeTypes = n2.nameValue.match(Node.nodeTypeRegEx);
            if (nodeTypes) {
              for (let t of nodeTypes) {
                typedefDeps[m[1]].add(t.slice(1));
              }
            }
            let listTypes = n2.nameValue.match(Node.listTypeRegEx);
            if (listTypes) {
              for (let t of listTypes) {
                typedefDeps[m[1]].add(t.slice(1));
              }
            }
          });
        }
      }
    });
    let tempMark = {};
    let permMark = {};
    let cyclePath = null;

    function hasCycle(name, stack = []) {
      if (permMark[name]) return false;
      if (tempMark[name]) {
        cyclePath = stack.concat(name);
        return true;
      }
      tempMark[name] = true;
      stack.push(name);

      let deps = typedefDeps[name];
      if (deps) {
        for (let dep of deps) {
          if (typedefDeps[dep]) {
            if (hasCycle(dep, stack)) {
              stack.pop();
              return true;
            }
          }
        }
      }

      stack.pop();
      permMark[name] = true;
      return false;
    }
    this.error.classList.add("hidden");
    for (let name in typedefDeps) {
      if (hasCycle(name)) {
        this.errorPath.textContent = cyclePath.join(" → ");
        this.error.classList.remove("hidden");
        return;
      }
    }

    if (Object.keys(typedefs).length) {
      this.root.traverse((n) => {
        if (!n.isAttribute) {
          let nodeTypes = n.nameValue.match(Node.nodeTypeRegEx) || [];
          let nodeTypeNames = nodeTypes.map((t) => t.slice(1));
          let prevNodeTypeNames = n.appliedNodeTypes || [];
          for (let t of prevNodeTypeNames) {
            if (!nodeTypeNames.includes(t)) {
              removeTypeApplication(n, t);
            }
          }
          n.appliedNodeTypes = nodeTypeNames;
          if (nodeTypes) {
            for (let i = nodeTypes.length - 1; i >= 0; i--) {
              let t = nodeTypes[i].slice(1);
              if (typedefs[t]) {
                n.merge(typedefs[t], t);
              }
            }
          }
          let listTypes = n.nameValue.match(Node.listTypeRegEx) || [];
          let listTypeNames = listTypes.map((t) => t.slice(1));
          let prevListTypeNames = n.appliedListTypes || [];

          for (let t of prevListTypeNames) {
            if (!listTypeNames.includes(t)) {
              for (let child of n.nonAttrChildren) {
                removeTypeApplication(child, t);
              }
            }
          }

          n.appliedListTypes = listTypeNames;
          if (listTypes) {
            for (let i = listTypes.length - 1; i >= 0; i--) {
              let t = listTypes[i].slice(1);
              if (typedefs[t]) {
                for (let child of n.nonAttrChildren) {
                  child.merge(typedefs[t], t);
                }
              }
            }
          }
        }
      });
    }
  }

  updateOutput() {
    this.root.traverse((n) => (n.outputs = []));
    if (this.root.nameValue.match(Node.typedefRegEx)) {
      this.root.widget;
      this.output.replaceChildren();
    } else if (
      !this.root.nameValue.startsWith("#") &&
      !this.root.nameValue.match(Node.attrRegEx)
    ) {
      this.output.replaceChildren(this.root.widget);
    } else {
      this.output.replaceChildren();
    }
  }

  updateTextStyles() {
    this.root.traverse((node) => {
      if (node.outputs?.length) {
        for (let attr of node.attrNodes) {
          if (attr._isAttribute[1] == "$style") {
            let text = attr.attributeSubstitution(attr._isAttribute[2]);
            for (let target of node.outputs) {
              styleText(target, text, attr.attributes);
            }
          } else if (attr._isAttribute[1] == "$bg") {
            for (let target of node.outputs) {
              target.style.background = attr._isAttribute[2];
            }
          }
        }
      }
    });
  }

  updateNameSize() {
    let longestName = 0;
    this.root.traverse((n) => {
      if (!n.nameValue.startsWith("$url=")) {
        if (n.nameValue.length > longestName) {
          if (n.nameValue.length <= Node.maxNameSize) {
            longestName = n.nameValue.length;
          } else {
            longestName = Node.maxNameSize;
            return true;
          }
        }
      }
    });
    if (longestName > Node.minNameSize) {
      this.root.traverse((n) => {
        n.name.size = longestName;
      });
    } else {
      this.root.traverse((n) => {
        n.name.size = Node.minNameSize;
      });
    }
  }

  update(skipUpdateOutput) {
    this.updateTypes();
    if (!skipUpdateOutput) {
      this.updateOutput();
    }
    this.updateTextStyles();
    this.updateNameSize();
    if (typedefMenu.menu.open) {
      typedefMenu.update();
    }
    if (lastEditedMenu.menu.open) {
      lastEditedMenu.update();
    }
    let name = this.name;
    if (name) {
      document.title = name + " - TE";
    } else {
      document.title = "Tree Editor";
    }
  }
}

function removeTypeApplication(node, typeName) {
  node.traverse((n) => {
    for (let child of Array.from(n.children.children)) {
      if (
        child.node.sourceOwner == typeName &&
        child.node.sourceType &&
        child.node.equals(child.node.sourceType)
      ) {
        child.node.remove(false);
      }
    }
  });
}

export default new Tree();
