class ExecShortcut {
  constructor(commands, bindObject = {}) {
    let cmds = {};
    for (let cmd in commands) {
      for (let c of cmd.split(/,\s*/)) {
        cmds[c] = commands[cmd];
      }
    }
    this.commands = cmds;
    this.bindObject = bindObject;
    this.prefixCommand = "";
    this.prefixCommands = {};
    for (let cmd in this.commands) {
      let pcList = cmd.split(" ");
      for (let i = 1; i < pcList.length; i++) {
        this.prefixCommands[pcList.slice(0, -i).join(" ")] = true;
      }
    }
  }

  handle(event) {
    let command = "";

    if (event.ctrlKey) {
      command += "Control+";
    }
    if (event.altKey) {
      command += "Alt+";
    }
    if (event.shiftKey) {
      command += "Shift+";
    }
    command += event.key;
    if (command in this.prefixCommands) {
      event.preventDefault();
      this.prefixCommand += command + " ";
    } else {
      let prefixedCommand = this.prefixCommand + command;
      if (this.commands[prefixedCommand]) {
        event.preventDefault();
        this.commands[prefixedCommand].action.bind(this.bindObject)(event);
        this.prefixCommand = "";
      } else if (this.prefixCommands[prefixedCommand]) {
        event.preventDefault();
        this.prefixCommand = prefixedCommand + " ";
      } else if (this.commands[command]) {
        event.preventDefault();
        this.commands[command].action.bind(this.bindObject)(event);
        this.prefixCommand = "";
      } else {
        this.prefixCommand = "";
      }
    }
  }
}

export default function registerShortcuts(element, commands, bindObject = {}) {
  let execShortcut = new ExecShortcut(commands, bindObject);
  element.addEventListener("keydown", (ev) => execShortcut.handle(ev));
}
