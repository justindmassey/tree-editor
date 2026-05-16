import { div, table, tr, td, h1, h2, code, p } from "./lib/elements.js";
import nodeCommands from "./node-commands.js";
import globalCommands from "./global-commands.js";
import widgets from "./widgets.js";

function reference(items) {
  let ref = table();
  for (let item in items) {
    ref.appendChild(tr(td(code(item)), td(items[item].description)));
  }
  return ref;
}

let toc = p();

function section(title) {
  let header = h2(title);
  toc.appendChild(
    div(title)
      .c("anchor")
      .e("click", () =>
        header.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      ),
  );
  return header;
}

let help = div(
  h1("Tree Editor"),
  toc,

  section("Global Commands"),
  reference(globalCommands),
  p(
    div("If the root node has the attribute ", code("$name"), ","),
    div("its value is used as the tree name when saving."),
    div("Otherwise the unescaped name of the root node is used."),
    div(
      "If pasted text contains a newline, it's pasted according to paste mode.",
    ),
    div("The default paste mode is ", code("replace"), "."),
  ),
  section("Node Commands"),
  p(
    div("There is always one root node."),
    div("You can copy/cut the whole node when no text is selected."),
  ),
  reference(nodeCommands),

  section("Widgets"),
  p(
    div("Widgets begin with ", code("-WIDGET ARGUMENT"), "."),
    div("Widgets are rendered to the output"),
    div("(press Alt+o to toggle the output visibility)."),
    div(
      'Nodes that start with a hash symbol ("',
      code("#"),
      '") ',
      div("are not rendered to the output."),
      div("Control-click a widget in the output to focus its node."),
      div("The output is updated in real time."),
      div(
        'The hash symbol and the dash ("',
        code("-"),
        '") at the beginning of a node name',
        div("can be escaped with a backslash."),
        div("A backslash can be escaped with a backslash."),
      ),
    ),
    div("Attributes that start with a ", code("$"), " are used by widgets."),
    div("The argument is a label unless stated otherwise."),
  ),
  reference(widgets),

  section("Attributes"),
  div("Attributes have the form ", code("NAME=VALUE"), "."),
  div(
    'Equals symbols ("',
    code("="),
    '") ',
    "can be escaped with a backslash.",
  ),
  div("A backslash can be escaped with a backslash."),
  div("Attribute values need no escaping."),
  div(code("$url"), "-attributes don't affect input size."),

  section("Attribute Substitution"),
  div("If a node name or attribute value contains ", code(";ATTRIBUTE_NAME;")),
  div(
    " then ",
    code(";ATTRIBUTE_NAME;"),
    " is replaced with that attribute's value.",
  ),
  div("Attribute lookup starts at the parent and moves upward."),
  div("Unescaping is performed before attribute substitution."),

  section("Type System"),
  div("Nodes with a name of the form ", code("::TYPE")),
  div("are type definitions."),
  div("Nodes with ", code(".TYPE"), " in their name"),
  div("inherit from that type definition."),
  div('The dots ("', code("."), '") can be escaped with a backslash.'),
  div("Children of nodes with ", code(":TYPE"), " in their name"),
  div("inherit from that type definition."),
  div('The colons ("', code(":"), '") can be escaped with a backslash.'),
  div("Type definitions can inherit from other type definitions."),
  div("Subtypes should come after base types."),
  div("Types are updated in real time."),
  div("Type definitions are not rendered to the output."),
  div("A backslash can be escaped with a backslash."),
  div(
    "Duplicate nodes in a type definition are ignored after the first occurrence.",
  ),

  section("Tree Export"),
  div("Nodes become indented lines of text."),
  div("This format is also used when a node is copied."),

  section("JSON Export"),
  div("Nodes and attributes become JSON properties."),
  div("Children of attribute nodes are ignored."),
  div("Duplicate names override the last."),
  div("If node and attribute names form array indexes ({0..n-1})"),
  div("the node is exported as an array."),

  section("XML Export"),
  div("Nodes with children become tags."),
  div("Attribute nodes become attributes."),
  div("Nodes without children become text content."),
  div("Children of attribute nodes are ignored."),

  p(
    div("Back to top")
      .c("anchor")
      .e("click", () => {
        help.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }),
  ),
).c("help", "hidden");

export default help;
