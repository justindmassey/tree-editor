import history from "./history.js";
import { post, get } from "./lib/ajax.js";
import treeMenu from "./tree-menu.js";
import Node from "./node.js";

let activeElement;

export default {
  "Control+Alt+n": {
    description: "new tree",
    action() {
      if (this.tree.root.remove()) {
        history.add();
      }
      this.tree.tree.scrollTop = 0;
      this.tree.output.scrollTop = 0;
      localStorage.setItem("tree", "");
    },
  },
  "Control+s": {
    description: "save the tree",
    action() {
      post(
        "/save/" + encodeURIComponent(this.tree.root.name.value),
        JSON.stringify(this.tree.root.serialize())
      ).then((res) => {
        if (res.error) {
          alert(res.error);
        } else {
          localStorage.setItem("tree", this.tree.root.name.value);
          treeMenu.update();
          flash();
        }
      });
    },
  },
  "Control+Alt+d": {
    description: "delete this tree",
    action() {
      get("/delete/" + encodeURIComponent(this.tree.root.name.value)).then(
        (res) => {
          if (res.error) {
            alert(res.error);
          } else {
            treeMenu.update();
            if (this.tree.root.remove()) {
              history.add();
            }
            this.tree.tree.scrollTop = 0;
            this.tree.output.scrollTop = 0;
            localStorage.setItem("tree", "");
            flash();
          }
        }
      );
    },
  },
  "Control+z": {
    description: "undo",
    action() {
      history.undo();
    },
  },
  "Control+y": {
    description: "redo",
    action() {
      history.redo();
    },
  },
  "Alt+r": {
    description: "focus root node",
    action() {
      this.tree.root.focus();
    },
  },
  "Alt+j": {
    description: "focus first node with string in its name",
    action() {
      let find = prompt("Focus first node containing:").toUpperCase();
      this.tree.root.traverse((n) => {
        if (
          n.name.value.toUpperCase().includes(find) &&
          document.activeElement != n.name
        ) {
          n.focus();
          return true;
        }
      });
    },
  },
  "Alt+h": {
    description: "toggle help display",
    action() {
      this.help.elem.classList.toggle("hidden");
      if (this.help.elem.classList.contains("hidden")) {
        localStorage.setItem("help", "");
      } else {
        localStorage.setItem("help", "true");
      }
    },
  },
  "Alt+m": {
    description: "toggle menu bar",
    action() {
      this.menuBar.elem.classList.toggle("hidden");
      if (this.menuBar.elem.classList.contains("hidden")) {
        localStorage.setItem("menuBar", "");
        this.tree.elem.style.marginTop = "0px";
      } else {
        localStorage.setItem("menuBar", "true");
        this.tree.elem.style.marginTop = this.menuBar.elem.offsetHeight + "px";
      }
    },
  },
  "Alt+o": {
    description: "toggle output",
    action() {
      this.tree.output.classList.toggle("hidden");
      if (this.tree.output.classList.contains("hidden")) {
        localStorage.setItem("output", "");
      } else {
        localStorage.setItem("output", "true");
      }
    },
  },
  "Alt+t": {
    description: "toggle tree",
    action() {
      if (!this.tree.tree.classList.contains("hidden")) {
        activeElement = document.activeElement;
      }
      this.tree.tree.classList.toggle("hidden");
      if (this.tree.tree.classList.contains("hidden")) {
        localStorage.setItem("showTree", "");
      } else {
        localStorage.setItem("showTree", "true");
        if (activeElement && activeElement.focus) {
          activeElement.focus();
        }
      }
    },
  },
};

function flash() {
  document.body.classList.remove("flash");
  document.body.offsetWidth;
  document.body.classList.add("flash");
}
