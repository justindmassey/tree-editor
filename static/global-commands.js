import history from "./history.js";
import { post, get } from "./lib/ajax.js";
import treeMenu from "./tree-menu.js";
import Node from "./node.js";

export default {
  "Control+s": {
    description: "save the tree",
    action() {
      post(
        "/save/" + encodeURIComponent(this.tree.root.name.value),
        JSON.stringify(this.tree.root.serialize())
      )
        .then((res) => {
          localStorage.setItem("tree", this.tree.root.name.value);
          treeMenu.update();
          flash();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  "Control+Alt+d": {
    description: "delete this tree",
    action() {
      get("/delete/" + encodeURIComponent(this.tree.root.name.value)).then(
        (res) => {
          treeMenu.update();
          this.tree.root = new Node();
          this.tree.root.focus();
          history.add();
          localStorage.setItem("tree", "");
          flash()
        }
      );
    },
  },
  "Control+z": {
    description: "undo",
    action: () => history.undo(),
  },
  "Control+y": {
    description: "redo",
    action: () => history.redo(),
  },
  "Alt+r": {
    description: "focus root node",
    action() {
      this.tree.root.focus();
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
    description: "toggle output display",
    action() {
      this.tree.output.classList.toggle("hidden");
      if (this.tree.output.classList.contains("hidden")) {
        localStorage.setItem("output", "");
      } else {
        this.tree.updateOutput();
        localStorage.setItem("output", "true");
      }
    },
  },
};

function flash() {
  document.body.classList.remove("flash");
  document.body.offsetWidth;
  document.body.classList.add("flash");
}
