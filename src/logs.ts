import chalk from "chalk";
import cliui from "cliui";
import { version } from "../package.json";

export function logVersion() {
  console.log(version);
}

export function logHelp() {
  console.log(chalk.bold.yellow("Under development"));
  console.log();
  console.log(chalk.bold("Usage:"));
  console.log(`  photo-frame <${chalk.cyan("command")}> [...args]`);
  console.log();
  console.log(chalk.bold("Example:"));
  console.log(`  photo-frame -i ~/foo/bar/photos -o ~/foo/bar/photos/dist`);

  const Width = 100;
  const WidthCommand = 30;
  const PaddingTitle = [1, 0, 0, 0];
  const PaddingCommand = [0, 4, 0, 2];

  const ui = cliui({ width: Width });

  ui.div({
    text: chalk.bold("Options:"),
    padding: PaddingTitle,
  });

  ui.div(
    {
      text: chalk.cyan("-i, --inputdir"),
      width: WidthCommand,
      padding: PaddingCommand,
    },
    "The folder you want to work on"
  );
  ui.div(
    {
      text: chalk.cyan("-o, --outdir"),
      width: WidthCommand,
      padding: PaddingCommand,
    },
    "Generate the folder where the photos are located"
  );
  console.log(ui.toString());
}
