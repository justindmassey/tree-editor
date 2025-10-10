import { div, h1 } from "./lib/elements.js";
import nodeToElement from "./node-to-element.js";

export default {
  ":h": {
    description: "a header",
    render(node, arg) {
      let children = div();
      for (let child of node.children.children) {
        children.appendChild(nodeToElement(child.node));
      }
      return div(h1(arg), children);
    },
  },
};
