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
          'Non-root nodes that start with a hash symbol ("',
          code("#"),
          '") ',
          div("are not rendered to the output."),
          div("Control-click a widget in the output to focus its node."),
          div("The output is updated in real time."),
          div(
            'The hash symbol and the dash ("',
            code("-"),
            '") at the beginning of a node name',
            div("can be escaped with a backslash.")
          )
        ),
        div("The argument is a label unless stated otherwise.")
      ),
      makeReference(widgets),

      h2("Attributes"),
      div("Attributes have the form ", code("NAME=VALUE"), "."),
      div(
        'Equals symbols ("',
        code("="),
        '") ',
        "can be escaped with a backslash."
      ),
      div("Attribute values need no escaping."),

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
      div("Types are updated in real time."),
      div("Type definitions that are not the root node"),
      div("are not rendered to the output."),
      div("Removing a type does not remove inherited nodes."),

      h2("Text Export"),
      div("Nodes are structured with indentation."),
      div("Text export is the only lossless one."),

      h2("JSON Export"),
      div("Nodes and attributes become JSON properties."),
      div("Dublicate names override the last."),

      h2("XML Export"),
      div("Nodes with children become tags."),
      div("Attribute nodes become attributes."),
      div("Nodes without children become lines of text."),
      div("Children of attribute nodes are ignored.")
    ).c("help", "hidden");
  }
}

export default new Help();
