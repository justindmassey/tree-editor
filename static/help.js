import { div, table, tr, td, h1, h2, code, p } from "./lib/elements.js";
import nodeCommands from "./node-commands.js";
import globalCommands from "./global-commands.js";
import widgets from "./widgets.js";

function makeReference(items) {
  let reference = table();
  for (let item in items) {
    reference.appendChild(tr(td(code(item)), td(items[item].description)));
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
        div("Widgets begin with ", code("-WIDGET ARGUMENT"), "."),
        div("Widgets are rendered to the output"),
        div("(press Alt+o to toggle the output visibility)."),
        div(
          'Equals symbols ("',
          code("="),
          '") and dashes("',
          code("-"),
          '") at the beginning of line',
          div(' can be escaped with a backslash ("', code("\\"), '").')
        ),
        div(
          "Escaping equals symbols following ",
          "the first unescaped one is optional."
        ),
        div(
          'Non-root nodes that start with a hash symbol ("',
          code("#", '")'),
          div("are not rendered to the output."),
          div("Control-click a widget to focus its node."),
          div("The output is updated in real time.")
        )
      ),
      makeReference(widgets),

      h2("Type System"),
      div("Nodes with a name of the form ", code("::TYPE")),
      div("are type definitions."),
      div("Nodes with ", code(".TYPE"), " in their name"),
      div("inherit from that type definition."),
      div('The dots ("', code("."), '") can be escaped with a backslash.'),
      div("Children of nodes with ", code(":TYPE"), " in their name"),
      div("inherit from that type definition."),
      div('The colons ("', code(":"), '") can be escaped with a backslash.'),
      div("Type definitions can inherit from other type definitions."),
      div("Type definitions that are not the root node"),
      div("are not rendered to the output."),
      div("Types are updated in real time."),

      h2("XML Export"),
      div("Nodes with children become tags."),
      div("Attribute nodes become attributes."),
      div("Nodes without children become lines of text.")
    ).c("help", "hidden");
  }
}

export default new Help();
