import history from "./history.js";
import { post, get } from "./lib/ajax.js";
import treeMenu from "./tree-menu.js";
import { div, code } from "./lib/elements.js";

export default {
  "Alt+h": {
    description: "show/hide help",
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
    description: "show/hide menu bar",
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
    description: "show/hide output",
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
    description: "show/hide tree",
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
        if (this.tree.activeElement && this.tree.activeElement.focus) {
          this.tree.activeElement.focus();
        }
      }
    },
  },
  "Alt+c": {
    description: "clear tree",
    action() {
      if (this.tree.root.remove()) {
        history.add();
      }
      this.tree.tree.scrollTop = 0;
      this.tree.output.scrollTop = 0;
    },
  },
  "Control+s": {
    description: "save the tree",
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
    description: "delete this tree",
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
          this.tree.tree.scrollTop = 0;
          this.tree.output.scrollTop = 0;
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
    description: "focus first node containing text",
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
    description: div("set paste mode to ", code("replace"), " (exchange)"),
    action() {
      this.tree.pasteMode = "replace";
      this.tree.toast.pop('Paste mode: "replace"');
    },
  },
  "Alt+a": {
    description: div("set paste mode to ", code("append")),
    action() {
      this.tree.pasteMode = "append";
      this.tree.toast.pop('Paste mode: "append"');
    },
  },
  "Alt+u": {
    description: div("set paste mode to ", code("merge"), " (unify)"),
    action() {
      this.tree.pasteMode = "merge";
      this.tree.toast.pop('Paste mode: "merge"');
    },
  },
};

function flash() {
  document.body.classList.remove("flash");
  document.body.offsetWidth;
  document.body.classList.add("flash");
}
