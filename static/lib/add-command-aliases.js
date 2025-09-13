export default function addCommandAliases(commands, aliases) {
  let res = {};
  for (let cmd in commands) {
    res[cmd] = commands[cmd];
    if (cmd in aliases) {
      for (let alias of aliases[cmd]) {
        res[alias] = commands[cmd];
      }
    }
  }
  return res;
}
