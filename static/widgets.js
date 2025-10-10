import { div, h1 } from "./lib/elements.js";

export default {
  ":h": {
    description: "a header",
    render(node, arg) {
      let children = div();
      for (let child of node.children.children) {
        children.appendChild(child.node.toElement());
      }
      return div(h1(arg), children);
    },
  },
};
