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
    let showMenuBar = localStorage.getItem("menuBar")
    if(showMenuBar) {
      setTimeout(globalCommands["Alt+m"].action.bind(this), 0)
    }
    let showHelp = localStorage.getItem("help")
    if(showHelp) {
      setTimeout(globalCommands["Alt+h"].action.bind(this), 0)
    }
  }
}

export default new TreeEditor();
