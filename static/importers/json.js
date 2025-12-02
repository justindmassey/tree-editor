import Node from "../node.js";

function importNode(node) {
  let res = [];
  for (let name in node) {
    if (node[name] instanceof Object) {
      res.push(new Node(name, ...importNode(node[name])));
    } else {
      res.push(new Node(name + "=" + node[name]));
    }
  }
  return res;
}

export default function importJson(json) {
  let nodes = importNode(JSON.parse(json));
  if (nodes.length == 1) {
    return nodes[0];
  } else {
    return new Node("", ...nodes);
  }
}
