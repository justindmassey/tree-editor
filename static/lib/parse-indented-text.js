export default function parseIndentedText(text) {
  let lines = text.split(/\r?\n/);
  var nodes = [{ indent: -1, line: "", children: [] }];
  for (let line of lines) {
    if (!line) {
      continue;
    }
    let m = line.match(/^(\s*)(.*)/);
    let node = {
      indent: m[1].length,
      line: m[2],
      children: [],
    };

    while (node.indent <= nodes[nodes.length - 1].indent) {
      nodes.pop();
    }
    nodes[nodes.length - 1].children.push(node);
    nodes.push(node);
  }
  if (nodes[0].children.length == 1) {
    return nodes[0].children[0];
  } else {
    return nodes[0];
  }
}
