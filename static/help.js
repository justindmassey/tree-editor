import { div, table, tr, td, h1, h2, code, p } from "./lib/elements.js";
import nodeCommands from "./node-commands.js";
import globalCommands from "./global-commands.js";
import widgets from "./widgets.js";

function makeReference(commands) {
  let commandsTable = table();
  for (let cmd in commands) {
    commandsTable.appendChild(tr(td(cmd), td(commands[cmd].description)));
  }
  return commandsTable;
}

class Help {
  constructor() {
    this.elem = div(
      h1("Help"),
      h2("Global Commands"),
      makeReference(globalCommands),
      h2("Node Commands"),
      makeReference(nodeCommands),
      h2("Widgets"),
      p(
        div("Widgets have the form ", code(":WIDGET ARGUMENT")),
        div("Widgets are rendered to the output")
      ),
      makeReference(widgets)
    ).c("help", "hidden");
  }
}

export default new Help();
