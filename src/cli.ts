import "../typings/main.d.ts";
// import * as fs from "fs";

let arg = process.argv.slice(2);

let output = "";

if (arg.length === 0) {
  output = "Supply filename\n";
} else {
  output = "Hello world\n";
}

process.stdout.write(output);
