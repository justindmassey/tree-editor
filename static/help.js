import { div, table, tr, td, h1, h2, code, p } from "./lib/elements.js";
import nodeCommands from "./node-commands.js";
import globalCommands from "./global-commands.js";
import widgets from "./widgets.js";

function makeReference(items) {
  let reference = table();
  for (let item in items) {
    reference.appendChild(tr(td(item), td(items[item].description)));
  }
  return reference;
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
        div("Widgets begin with ", code(":WIDGET ARGUMENT"), "."),
        div("Widgets are rendered to the output."),
        div(
          'Equals symbols ("',
          code("="),
          '") can be escaped with a backslash ("',
          code("\\"),
          '").'
        ),
        div("Escaping equals symbols following the first unescaped one is optional")
      ),
      makeReference(widgets)
    ).c("help", "hidden");
  }
}

export default new Help();
