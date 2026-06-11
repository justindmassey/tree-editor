import history from "./history.js";
import { post, get } from "./lib/ajax.js";
import treeMenu from "./tree-menu.js";
import { div, code, var_ } from "./lib/elements.js";
import Node from "./node.js";

export default {
  "Alt+h": {
    description: "Show/hide help",
    action() {
      if (this.help.classList.toggle("hidden")) {
        localStorage.setItem("help", "");
      } else {
        localStorage.setItem("help", "true");
      }
    },
  },
  "Alt+m": {
    description: "Show/hide menu bar",
    action() {
      if (this.menuBar.elem.classList.toggle("hidden")) {
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
      if (this.tree.output.classList.toggle("hidden")) {
        localStorage.setItem("output", "");
      } else {
        localStorage.setItem("output", "true");
      }
    },
  },
  "Alt+t": {
    description: "Show/hide tree",
    action() {
      if (this.tree.tree.classList.toggle("hidden")) {
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
    description: "New tree",
    action() {
      this.tree.autosave();
      history.clear();
      this.tree.root.remove();
      history.add();
      this.tree.scrollToTop();
      localStorage.removeItem("tree");
      localStorage.removeItem("root");
      let url = new URL(location);
      url.searchParams.delete("tree");
      url.searchParams.delete("root");
      window.history.pushState({}, "", url);
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
            localStorage.removeItem("root");
            let url = new URL(location);
            url.searchParams.set("tree", name);
            url.searchParams.delete("root");
            window.history.replaceState({ tree: name }, "", url);
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
      this.tree.autosave();
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

            flash();
            this.tree.toast.pop(`Deleted "${name}"`);
          } else {
            this.tree.toast.pop(`The tree "${name}" was not found`);
          }
          if (localStorage.getItem("tree") == name) {
            localStorage.removeItem("tree");
            localStorage.removeItem("root");
            let url = new URL(location);
            url.searchParams.delete("tree");
            url.searchParams.delete("root");
            window.history.replaceState({}, "", url);
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
      this.tree.root.focus(true);
    },
  },
  "Control+DIGIT": {
    name: div("Control+", var_("DIGIT")),
    description: div("Expand only nodes up to level ", code(var_("DIGIT"))),
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
          n.focus(true);
          return true;
        }
      });
    },
  },
  "Alt+x r": {
    description: div("Set paste mode to ", code("replace")),
    action() {
      this.tree.pasteMode = "replace";
      this.tree.toast.pop('Paste mode: "replace"');
    },
  },
  "Alt+x a": {
    description: div("Set paste mode to ", code("append")),
    action() {
      this.tree.pasteMode = "append";
      this.tree.toast.pop('Paste mode: "append"');
    },
  },
  "Alt+x m": {
    description: div("Set paste mode to ", code("merge")),
    action() {
      this.tree.pasteMode = "merge";
      this.tree.toast.pop('Paste mode: "merge"');
    },
  },
  "Alt+y": {
    description: "Recover last session",
    action() {
      let lastSession = localStorage.getItem("autosave");
      if (lastSession) {
        this.tree.root = Node.deserialize(JSON.parse(lastSession));
        this.tree.root.focus();
        this.tree.scrollToTop();
        history.clear();
        setTimeout(() => history.add(), 0);
      }
    },
  },

  "Alt+x c": {
    description: "Toggle centering of output when the tree is hidden",
    action() {
      let centered = this.tree.output.classList.toggle("centered");
      localStorage.setItem("centerOutput", centered || "");
      if (!this.tree.tree.classList.contains("hidden")) {
        if (centered) {
          this.tree.toast.pop("Output centered when tree is hidden");
        } else {
          this.tree.toast.pop("Output left aligned when tree is hidden");
        }
      }
    },
  },
  "Alt+x s": {
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
