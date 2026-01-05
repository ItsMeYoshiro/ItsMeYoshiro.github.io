const terminal = document.getElementById("terminal");
const typer = document.getElementById("typer");
const texter = document.getElementById("texter");

let buffer = "";

/* ========================= */
/* PRINT FUNCTIONS */
/* ========================= */
function print(text, cls = "") {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  terminal.appendChild(p);
  window.scrollTo(0, document.body.scrollHeight);
}

function printAscii(lines) {
  const pre = document.createElement("pre");
  pre.className = "ascii";
  pre.textContent = lines.join("\n");
  terminal.appendChild(pre);
  window.scrollTo(0, document.body.scrollHeight);
}

/* ========================= */
/* BOOT SEQUENCE */
/* ========================= */
const bootText = [
  "Call trans opt: received. 2-19-98 13:24:18 REC:Loc",
  "Trace program: running",
  "",
  "wake up, Neo...",
  "the matrix has you",
  "follow the white rabbit.",
  "",
  "knock, knock, Neo.",
  ""
];

const asciiArt = [
"            (`.         ,-,",
"            ` `.    ,;' /",
"             `.  ,'/ .'",
"              `. X /.'",
"    .-;--''--.._` ` (",
"  .'            /   `",
" ,           ` '   Q '",
" ,         ,   `._    \\",
",|         '     `-.;_'",
":  . `  ;    `  ` --,.._;",
" ' `    ,   )   .'",
"    `._ ,  '   /_",
"       ; ,''-,;' ``-",
"        ``-..__``--`"
];

bootText.forEach(line => print(line));
printAscii(asciiArt);
print("");
print("Bem-vindo ao meu portfolio, digite Help para descobrir os comandos.");
print("Visite o meu Blog de cibersegurança!");
print("https://itsmeyoshiro.github.io/")
print("");

/* ========================= */
/* INPUT HANDLING */
/* ========================= */
texter.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();

    const cmd = buffer.trim();
    print("visitante@kaiobarbosa:~$ " + cmd, "command-line");

    runCommand(cmd);

    buffer = "";
    typer.textContent = "";
  } 
  else if (e.key === "Backspace") {
    buffer = buffer.slice(0, -1);
    typer.textContent = buffer;
  }
});

texter.addEventListener("keypress", e => {
  if (e.key.length === 1) {
    buffer += e.key;
    typer.textContent = buffer;
  }
});

/* Mobile: focar input ao tocar na tela */
document.body.addEventListener("click", () => {
  texter.focus();
});

/* ========================= */
/* COMMAND ENGINE */
/* ========================= */
function runCommand(cmd) {
  if (!cmd) return;

  const parts = cmd.toLowerCase().split(" ");
  const base = parts[0];

  if (base === "clear") {
    terminal.innerHTML = "";
    return;
  }

  if (base === "project") {
    const name = parts.slice(1).join("");
    if (commands.project && commands.project[name]) {
      commands.project[name].forEach(line => print(line, "output"));    } else {
      print("Projeto não encontrado.", "error");
    }
    return;
  }

  if (!commands[base]) {
    print(`command not found: ${cmd}`, "error");
    return;
  }

  commands[base].forEach(line => print(line, "output"));
}
