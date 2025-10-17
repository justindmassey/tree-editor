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
} from "./lib/elements.js";
import history from "./history.js";
import { unescape } from "./node.js";

export default {
  "-h": {
    description: div(
      div("a large header with the children below"),
      div(code("ARGUMENT"), ": the header text")
    ),
    create(node, arg) {
      let children = div();
      for (let child of node.nonAttrChildren) {
        children.appendChild(child.toElement());
      }
      return div(h1(arg), children);
    },
  },
  "-l": {
    description: div(
      div("a hyperlink"),
      div(code("ARGUMENT"), ": the link text"),
      div(code("url"), ": The URL the link opens")
    ),
    create(node, arg) {
      let link = a(arg).a("target", "_blank");
      if ("url" in node.attributes) {
        link.href = node._atts.url;
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
            history.add();
          });
        if ("checked" in child.attributes) {
          checkbox.checked = child._atts.checked == "true";
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
  "-t": {
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
        header.appendChild(td(unescape(child.name.value) || " "));
        let grandchildrenCnt = child.nonAttrChildren.length;
        if (grandchildrenCnt > longestChild) {
          longestChild = grandchildrenCnt;
        }
      }
      for (let i = 0; i < longestChild; i++) {
        let row = tr();
        for (let child of node.nonAttrChildren) {
          let cell = child.nonAttrChildren[i];
          if (cell) {
            if (!cell.isAttribute) {
              row.appendChild(td(cell.toElement()));
            }
          } else {
            row.appendChild(td());
          }
        }
        bdy.appendChild(row);
      }
      let tbl = table(thead(header), bdy);
      if (arg) {
        return div(div(arg), tbl);
      } else {
        return tbl;
      }
    },
  },
};
