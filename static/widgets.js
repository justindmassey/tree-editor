import {
  div,
  h1,
  a,
  input,
  code,
  table,
  tr,
  td,
  thead,
  tbody,
  textarea,
} from "./lib/elements.js";
import history from "./history.js";
import Tabs from "./lib/tabs.js";
import Node from "./node.js";

export default {
  "-hdr": {
    description: div(
      div("a large header with the children below"),
      div(code("ARGUMENT"), ": the header text")
    ),
    create(node, arg) {
      let children = div();
      for (let child of node.nonAttrChildren) {
        children.appendChild(child.toElement());
      }
      return div(h1(arg), children).c("hdr");
    },
  },
  "-lnk": {
    description: div(
      div("a hyperlink"),
      div(code("ARGUMENT"), ": the link text"),
      div(code("url"), ": The URL the link opens")
    ),
    create(node, arg) {
      let link = a(arg).a("target", "_blank");
      if ("url" in node.attributes) {
        link.href = node._attributes.url;
      } else {
        node.setAttribute("url");
      }
      return div(link);
    },
  },
  "-cl": {
    description: div(
      div("turns each child into a checklist item"),
      div(code("ARGUMENT"), ": the label to display above the list"),
      div("items have the attribute ", code("checked"))
    ),
    create(node, arg) {
      let checklist = div();
      for (let child of node.nonAttrChildren) {
        let checkbox = input()
          .a("type", "checkbox")
          .e("change", () => {
            child.setAttribute("checked", checkbox.checked);
            history.add(true);
          });
        if ("checked" in child.attributes) {
          checkbox.checked = child._attributes.checked == "true";
        } else {
          child.setAttribute("checked", "false");
        }
        checklist.appendChild(
          div(checkbox, child.toElement()).c("checklist-item")
        );
      }
      if (arg) {
        return div(div(arg), checklist);
      } else {
        return checklist;
      }
    },
  },
  "-tbl": {
    description: div(
      div("a table"),
      div(code("ARGUMENT"), ": a label to display above the table"),
      div("each childs name is a table header and its children the column")
    ),
    create(node, arg) {
      let header = tr();
      let bdy = tbody();
      let longestChild = 0;

      for (let child of node.nonAttrChildren) {
        header.appendChild(td(child.nameText));
        if (child.nonAttrChildren.length > longestChild) {
          longestChild = child._nonAttrChildren.length;
        }
      }
      for (let i = 0; i < longestChild; i++) {
        let row = tr();
        for (let child of node._nonAttrChildren) {
          let cell = child.nonAttrChildren[i];
          if (cell) {
            row.appendChild(td(cell.toElement()));
          } else {
            row.appendChild(td());
          }
        }
        bdy.appendChild(row);
      }
      let tbl = table(thead(header), bdy);
      if (arg) {
        return div(div(arg), tbl).c("tbl");
      } else {
        return tbl.c("tbl");
      }
    },
  },
  "-tbs": {
    description: div(
      div("a tab panel"),
      div(code("ARGUMENT"), ": a label to show above the tabs"),
      div(
        "each child name becomes a tab name and its children the tab content"
      ),
      div(code("tab"), " holds the current tab")
    ),
    create(node, arg) {
      let tabs = {};
      for (let child of node.nonAttrChildren) {
        tabs[child.nameText] = div();
        for (let grandchild of child.nonAttrChildren) {
          tabs[child._nameText].appendChild(grandchild.toElement());
        }
      }
      let tabsObj = new Tabs(tabs, (tab) => {
        node.setAttribute("tab", tab);
        history.add(true);
      });
      if ("tab" in node.attributes && tabs[node._attributes.tab]) {
        tabsObj.tab = node._attributes.tab;
      } else {
        node.setAttribute("tab", tabsObj.tab);
      }
      if (arg) {
        return div(div(arg), tabsObj.elem);
      } else {
        return tabsObj.elem;
      }
    },
  },
  "-ta": {
    description: div(
      div("a textarea"),
      div(code("ARGUMENT"), ": a label"),
      div("children become lines of text")
    ),
    create(node, arg) {
      let ta = textarea()
        .a("rows", 8)
        .a("cols", 40)
        .e("input", () => {
          node.children.replaceChildren();
          for (let line of ta.value.split("\n")) {
            node.appendChild(new Node(line), false);
          }
          history.add(true)
        });
      let lines = [];
      for (let child of node.children.children) {
        lines.push(child.node.name.value);
      }
      ta.value = lines.join("\n");
      if (arg) {
        return div(div(arg), ta);
      } else {
        return ta;
      }
    },
  },
};
