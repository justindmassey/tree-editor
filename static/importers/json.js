import Node from "../node.js";

function importNode(node) {
  let res = [];
  for (let name in node) {
    if (node[name] instanceof Object) {
      let n = new Node(name);
      if (node[name] instanceof Object) {
        for (let child of importNode(node[name])) {
          n.appendChild(child);
        }
      }
      res.push(n);
    } else {
      res.push(new Node(name + "=" + node[name]));
    }
  }
  return res;
}

export default function importJson(json) {
  return importNode(JSON.parse(json))[0];
}
