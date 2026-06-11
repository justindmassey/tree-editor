import {
  div,
  table,
  tr,
  td,
  h1,
  h2,
  code,
  p,
  ul,
  li,
  a,
  var_,
} from "./lib/elements.js";
import nodeCommands from "./node-commands.js";
import editorCommands from "./editor-commands.js";
import widgets from "./widgets.js";
import crossRef from "./cross-ref.js";

function reference(items) {
  let ref = table();
  for (let item in items) {
    ref.appendChild(
      tr(td(code(items[item].name ?? item)), td(items[item].description)),
    );
  }
  return ref;
}

let toc = p();

function section(title) {
  let header = h2(title);
  header.id = title;
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

  section("Editor Commands"),
  reference(editorCommands),
  p(
    div(
      "If the root node has the attribute ",
      code("$name"),
      " ",
      crossRef("Attributes"),
      ",",
    ),
    div("its value is used as the tree name when saving."),
    div(
      "Otherwise the unescaped name of the root node is used ",
      crossRef("Node Names"),
      ".",
    ),
    div("The default paste mode is ", code("replace"), "."),
  ),

  section("Node Commands"),
  p(
    div("There is always one root node."),
    div("You can copy or cut a whole node when there’s no text selected."),
    div(
      "How a node is pasted depends on paste mode ",
      crossRef("Editor Commands"),
      ".",
    ),
    div(
      "Any clipboard text containing a newline is treated as a node when pasting.",
    ),
  ),
  reference(nodeCommands),
  p(
    div(
      "If mousewheel node movement is turned on ",
      crossRef("Editor Commands"),
    ),
    div(
      "a node can be moved up or down with ",
      code("Shift+Mousewheel"),
      " over the tree",
    ),
    div(
      "and siblings can be moved up or down with ",
      code("Alt+Shift+Mousewheel"),
      " over the tree.",
    ),
  ),

  section("Widgets"),
  p(
    div("Widgets begin with ", code("-", var_("WIDGET ARGUMENT")), "."),
    div("Widgets are rendered to the output"),
    div("(press Alt+o to toggle the output visibility)."),
    div(
      'Nodes that start with a hash symbol ("',
      code("#"),
      '") ',
      div("are not rendered to the output."),
      div(code("Control-Click"), " a widget in the output to focus its node."),
      div(
        'The hash symbol and the dash ("',
        code("-"),
        '") at the beginning of a node name',
        div("can be escaped with a backslash."),
        div("A backslash can be escaped with a backslash."),
      ),
    ),
    div(
      "Attributes used by widgets start with a ",
      code("$"),
      " ",
      crossRef("Attributes"),
      ".",
    ),
    div("The ", code("argument"), " is a label unless stated otherwise."),
    p(
      div(
        "You can set multiple ",
        code("$st"),
        "-attributes (style text) on a widget.",
      ),
      div(
        div(
          "The value of ",
          code("$st"),
          " is found within the widget text and styled",
        ),
        div("(matched case insensitively)."),
      ),
      div(
        "If a ",
        code("$st"),
        "-attribute has an empty value, it matches all text.",
      ),
      div(
        div("The children of the ", code("$st"), "-attributes"),
        div(
          "are the ",
          a("CSS properties").a(
            "href",
            "https://developer.mozilla.org/docs/Web/CSS/Reference/Properties",
          ),
          " to be applied to the matched text",
        ),
        div(
          "(for example: ",
          code("background=yellow"),
          " or ",
          code("font-weight=bold"),
          ").",
        ),
        div(
          "If ",
          code("$fg"),
          " is set to a ",
          a("CSS color").a(
            "href",
            "https://developer.mozilla.org/docs/Web/CSS/Reference/Values/color_value",
          ),
          ", it sets the widget's text color in the output.",
        ),
        div(
          "If ",
          code("$bg"),
          " is set to a ",
          a("CSS color").a(
            "href",
            "https://developer.mozilla.org/docs/Web/CSS/Reference/Values/color_value",
          ),
          ", it sets the widgets background color in the output.",
        ),
      ),
    ),
  ),
  reference(widgets),

  section("Attributes"),
  div("Attributes have the form ", code(var_("NAME"), "=", var_("VALUE")), "."),
  div(
    'Equals symbols ("',
    code("="),
    '") ',
    "can be escaped with a backslash.",
  ),
  div("A backslash can be escaped with a backslash."),
  div("Attribute values need no escaping."),
  div(
    "A widget may use special attributes that start with a ",
    code("$"),
    " ",
    crossRef("Widgets"),
    ".",
  ),
  div(code("$url"), "-attributes don't affect input size."),

  section("Attribute Substitution"),
  div(
    "If a node name or attribute value contains ",
    code(";", var_("ATTRIBUTE_NAME"), ";"),
  ),
  div(
    " then ",
    code(";", var_("ATTRIBUTE_NAME"), ";"),
    " is replaced with that attribute's value.",
  ),
  div("Attribute lookup starts in the current node and moves upward."),
  div("Unescaping is performed before attribute substitution."),

  section("Types"),
  div("Nodes with a name of the form ", code("::", var_("TYPE"))),
  div("are type definitions."),
  div("Nodes with ", code(".", var_("TYPE")), " in their name"),
  div("inherit from that type definition."),
  div('The dots ("', code("."), '") can be escaped with a backslash.'),
  div("Children of nodes with ", code(":", var_("TYPE")), " in their name"),
  div("inherit from that type definition."),
  div('The colons ("', code(":"), '") can be escaped with a backslash.'),
  div("Type definitions can inherit from other type definitions."),
  div("Subtypes should come after base types."),
  div("Type definitions are not rendered to the output."),
  div("A backslash can be escaped with a backslash."),
  div(
    "Duplicate nodes in a type definition are ignored after the first occurrence.",
  ),
  div("Type names can't include colons or dots."),

  section("Node Names"),
  div("A node's name is the text in its input field."),
  div("When a node name is displayed in the output or used as tree name,"),
  div("it is unescaped."),
  div("Unescaping removes:"),
  ul(
    li("widget prefixes ", crossRef("Widgets")),
    li("type application suffixes ", crossRef("Types")),
    li("backslashes that escape syntax"),
    li("comment prefixes (", code("#"), ")"),
    li("type definition prefixes (", code("::"), ")"),
  ),

  section("Tree Export"),
  div("Nodes become indented lines of text."),
  div(
    "This format is also used when a node is copied ",
    crossRef("Node Commands"),
    ".",
  ),

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

  section("Feedback"),
  div("Please report any bug, annoyance, or idea for improvement"),
  div(
    "to ",
    a("justindmassey@gmail.com").a("href", "mailto:justindmassey@gmail.com"),
    " or on ",
    a("Tree Editor's GitHub page")
      .a("target", "_blank")
      .a("href", "https://github.com/justindmassey/tree-editor"),
    ".",
  ),

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

toc.appendChild(
  div(a("Changelog").a("target", "_blank").a("href", "./changelog.txt")),
);

export default help;
