import tree from "./tree.js";
import registerShortcuts from "./lib/register-shortcuts.js";
import globalCommands from "./global-commands.js";
import help from "./help.js";
import { div } from "./lib/elements.js";
import menuBar from "./menu-bar.js";

class TreeEditor {
  constructor() {
    this.menuBar = menuBar;
    this.tree = tree;
    this.help = help;
    this.elem = div(this.menuBar, this.tree, this.help);
    registerShortcuts(window, globalCommands, this);
    window.addEventListener("keydown", (ev) => {
      if (ev.ctrlKey && ev.key.match(/^\d$/)) {
        let upToLevel = Number(ev.key);
        this.tree.root.traverse((node, level) => {
          if (level <= upToLevel) {
            node.expand();
          } else {
            node.collapse();
          }
        });
      }
    });
  }
}

export default new TreeEditor();
