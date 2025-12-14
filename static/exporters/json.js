function isArray(node) {
  if (node.children.children.length) {
    for (let i = 0; i < node.children.children.length; i++) {
      let child = node.children.children[i].node;
      if (child.isAttribute) {
        if (child._isAttribute[1] != i) {
          return false;
        }
      } else {
        if (child.name.value != i) {
          return false;
        }
      }
    }
  } else {
    return false;
  }
  return true;
}

function exportNode(node) {
  let n;
  if (isArray(node)) {
    n = [];
    for (let child of node.children.children) {
      if (child.node.isAttribute) {
        n.push(child.node._isAttribute[2]);
      } else {
        n.push(exportNode(child.node));
      }
    }
  } else {
    n = {};
    for (let child of node.children.children) {
      if (child.node.isAttribute) {
        n[child.node._isAttribute[1]] = child.node._isAttribute[2];
      } else {
        n[child.node.name.value] = exportNode(child.node);
      }
    }
  }
  return n;
}

export default function exportToJson(node) {
  if (node.isAttribute) {
    if (node._isAttribute[1] == "0") {
      return JSON.stringify([node._isAttribute[2]]);
    } else {
      return JSON.stringify({ [node._isAttribute[1]]: node._isAttribute[2] });
    }
  } else {
    if (node.name.value == "0") {
      return JSON.stringify([exportNode(node)], null, 4);
    } else {
      return JSON.stringify({ [node.name.value]: exportNode(node) }, null, 4);
    }
  }
}
