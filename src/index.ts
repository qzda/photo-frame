import process from "node:process";
import kleur from "kleur";
import { logHelp, logVersion } from "./logs";
import { generat } from "./generat";

const [runtime, filepath, ...args] = process.argv;

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
  generat(args[1], args[3]);
} else {
  console.error(
    `The command ${kleur.bgRed(`photo-frame ${args.join(" ")}`)} is invalid.`
  );
}
