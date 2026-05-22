import history from "./history.js";
import { post, get } from "./lib/ajax.js";
import treeMenu from "./tree-menu.js";
import { div, code } from "./lib/elements.js";
import Node from "./node.js";

export default {
  "Alt+h": {
    description: "Show/hide help",
    action() {
      this.help.classList.toggle("hidden");
      if (this.help.classList.contains("hidden")) {
        localStorage.setItem("help", "");
      } else {
        localStorage.setItem("help", "true");
      }
    },
  },
  "Alt+m": {
    description: "Show/hide menu bar",
    action() {
      this.menuBar.elem.classList.toggle("hidden");
      if (this.menuBar.elem.classList.contains("hidden")) {
        localStorage.setItem("menuBar", "");
        this.tree.elem.style.marginTop = "0px";
        this.tree.elem.style.height = "";
      } else {
        localStorage.setItem("menuBar", "true");
        this.tree.elem.style.marginTop = this.menuBar.elem.offsetHeight + "px";
        if (!this.tree.tree.classList.contains("hidden")) {
          this.tree.elem.style.height =
            "calc(100vh - " + this.menuBar.elem.offsetHeight + "px)";
        }
      }
    },
  },
  "Alt+o": {
    description: "Show/hide output",
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
    description: "Show/hide tree",
    action() {
      this.tree.tree.classList.toggle("hidden");
      if (this.tree.tree.classList.contains("hidden")) {
        localStorage.setItem("showTree", "");
        this.tree.elem.style.height = "";
      } else {
        if (!this.menuBar.elem.classList.contains("hidden")) {
          this.tree.elem.style.height =
            "calc(100vh - " + this.menuBar.elem.offsetHeight + "px)";
        }
        localStorage.setItem("showTree", "true");
        if (this.tree.activeNode) {
          this.tree.activeNode.focus();
        }
      }
    },
  },
  "Alt+k": {
    description: "Clear tree",
    action() {
      if (this.tree.root.remove()) {
        history.add();
      }
      this.tree.scrollToTop();
    },
  },
  "Control+s": {
    description: "Save the tree",
    action() {
      let name = this.tree.name;
      if (
        !(
          localStorage.getItem("tree") != name &&
          treeMenu.trees.includes(name) &&
          !confirm(`The tree "${name}" already exists and will be overwritten.`)
        )
      ) {
        post(
          "/save?name=" + encodeURIComponent(name),
          JSON.stringify(this.tree.root.serialize()),
        ).then((res) => {
          if (res.error) {
            alert(res.error);
          } else {
            localStorage.setItem("tree", name);
            treeMenu.update();
            this.tree.toast.pop(`Saved "${name}"`);
            flash();
          }
        });
      }
    },
  },
  "Control+Alt+d": {
    description: "Delete this tree",
    action() {
      let name = this.tree.name;
      if (
        !(
          localStorage.getItem("tree") != name &&
          treeMenu.trees.includes(name) &&
          !confirm(`The existing tree "${name}" will be deleted.`)
        )
      ) {
        get("/delete?name=" + encodeURIComponent(name)).then((res) => {
          if (this.tree.root.remove()) {
            history.add();
          }
          this.tree.scrollToTop();
          if (!res.error) {
            treeMenu.update();
            if (localStorage.getItem("tree") == name) {
              localStorage.removeItem("tree");
            }
            flash();
            this.tree.toast.pop(`Deleted "${name}"`);
          }
        });
      }
    },
  },
  "Control+z": {
    description: "Undo",
    action() {
      history.undo();
    },
  },
  "Control+y": {
    description: "Redo",
    action() {
      history.redo();
    },
  },
  "Alt+r": {
    description: "Focus root node",
    action() {
      this.tree.root.focus();
    },
  },
  "Control+DIGIT": {
    description: div("Expand only nodes up to level ", code("DIGIT"))
  },
  "Alt+j": {
    description: "Focus first node containing text (case insensitive)",
    action() {
      let find = prompt("Focus first node containing:").toUpperCase();
      this.tree.root.traverse((n) => {
        if (
          n.nameValue.toUpperCase().includes(find) &&
          document.activeElement != n.name
        ) {
          n.focus();
          return true;
        }
      });
    },
  },
  "Alt+e": {
    description: div("Set paste mode to ", code("replace"), " (exchange)"),
    action() {
      this.tree.pasteMode = "replace";
      this.tree.toast.pop('Paste mode: "replace"');
    },
  },
  "Alt++": {
    description: div("Set paste mode to ", code("append")),
    action() {
      this.tree.pasteMode = "append";
      this.tree.toast.pop('Paste mode: "append"');
    },
  },
  "Alt+u": {
    description: div("Set paste mode to ", code("merge"), " (unify)"),
    action() {
      this.tree.pasteMode = "merge";
      this.tree.toast.pop('Paste mode: "merge"');
    },
  },
  "Alt+x r": {
    description: "Recover last session",
    action() {
      let lastSession = localStorage.getItem("autosave");
      if (lastSession) {
        this.tree.root = Node.deserialize(JSON.parse(lastSession));
        this.tree.root.focus();
        history.clear();
        setTimeout(() => history.add(), 0);
      }
    },
  },
  "Alt+w": {
    description: "Toggle mousewheel node movement",
    action() {
      this.tree.wheelNodeMovement = !this.tree.wheelNodeMovement;
      localStorage.setItem(
        "wheelNodeMovement",
        this.tree.wheelNodeMovement || "",
      );
      this.tree.toast.pop(
        "Mousewheel node movement: " +
          { true: "on", false: "off" }[this.tree.wheelNodeMovement],
      );
    },
  },
  "Control+g": {
    description: "Clear the current prefix command",
    action() {
      this.tree.toast.pop("Prefix command cleared");
    },
  },
};

function flash() {
  document.body.classList.remove("flash");
  document.body.offsetWidth;
  document.body.classList.add("flash");
}
