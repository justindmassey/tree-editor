import { div, table, tr, td, h1, h2 } from "./lib/elements.js";
import nodeCommands from "./node-commands.js";
import globalCommands from "./global-commands.js";

function makeCommandReference(commands) {
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
      makeCommandReference(globalCommands),
      h2("Node Commands"),
      makeCommandReference(nodeCommands)
    ).c("help", "hidden");
  }
}

export default new Help();
