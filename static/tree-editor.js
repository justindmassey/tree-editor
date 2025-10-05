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
    if(localStorage.getItem("menuBar")) {
      setTimeout(globalCommands["Alt+m"].action.bind(this), 0);
    }
    if(localStorage.getItem("help")) {
      setTimeout(globalCommands["Alt+h"].action.bind(this), 0);
    }
    if(localStorage.getItem("output")) {
      setTimeout(globalCommands["Alt+o"].action.bind(this), 0);
    }
  }
}

export default new TreeEditor();
