import process from "node:process";
import kleur from "kleur";
import { logHelp, logVersion } from "./logs";
import { generate } from "./generate";

function mian() {
  const args = process.argv.slice(2);

  if (args.length === 1 && ["-v", "--version"].includes(args[0])) {
    logVersion();
  } else if (
    args.length === 0 ||
    (args.length === 1 && ["-h", "--help"].includes(args[0]))
  ) {
    logHelp();
  } else if (
    args.length === 4 &&
    ["-i", "--inputdir"].includes(args[0]) &&
    args[1].length &&
    ["-o", "--outdir"].includes(args[2]) &&
    args[3].length
  ) {
    generate(args[1], args[3]);
  } else {
    console.error(
      `The command ${kleur.bgRed(`photo-frame ${args.join(" ")}`)} is invalid.`
    );
  }
}

mian();
