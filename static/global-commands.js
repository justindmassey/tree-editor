import history from "./history.js";

export default {
  "Control+s": {
    description: "save the tree",
    action() {
      localStorage.setItem("tree", JSON.stringify(this.tree.root.serialize()));
      document.body.classList.remove("flash");
      document.body.offsetWidth;
      document.body.classList.add("flash");
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
    },
  },
  "Alt+m": {
    description: "toggle menu bar",
    action() {
      this.menuBar.elem.classList.toggle("hidden");
      if (this.menuBar.elem.classList.contains("hidden")) {
        this.tree.elem.style.marginTop = "0px";
      } else {
        this.tree.elem.style.marginTop = this.menuBar.elem.offsetHeight + "px";
      }
    },
  },
};
