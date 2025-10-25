import tree from "./tree.js";
import Node from "./node.js";
import History from "./lib/history.js";

class TreeHistory extends History {
  constructor() {
    super(() => {
      tree.updateTypes();
      tree.updateOutput();
    });
  }

  serialize() {
    return tree.root.serialize();
  }

  deserialize(node) {
    tree.root = Node.deserialize(node);
  }
}

export default new TreeHistory();
