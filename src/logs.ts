import cliui from "cliui";
import prolog from "@qzda/prolog";
import { name, version } from "../package.json";

export function logVersion() {
  console.log(version);
}

export function logHelp() {
  console.log(prolog.bold(`${name} v${version}`));
  console.log();
  console.log(prolog.bold("Usage:"));
  console.log(`  ${name} ${prolog.cyan("[...args]")}`);
  console.log();
  console.log(prolog.bold("Example:"));
  console.log(`  ${name} -i ~/foo/bar/input -o ~/foo/bar/photos/dist`);

  const Width = 100;
  const WidthCommand = 30;
  const PaddingTitle = [1, 0, 0, 0];
  const PaddingCommand = [0, 4, 0, 2];

  const ui = cliui({ width: Width });

  ui.div({
    text: prolog.bold("Options:"),
    padding: PaddingTitle,
  });

  ui.div(
    {
      text: prolog.cyan("-i, --inputdir"),
      width: WidthCommand,
      padding: PaddingCommand,
    },
    "The folder you want to work on"
  );
  ui.div(
    {
      text: prolog.cyan("-o, --outdir"),
      width: WidthCommand,
      padding: PaddingCommand,
    },
    "Generate the folder where the photos are located"
  );
  ui.div(
    {
      text: prolog.cyan("-c, --clear"),
      width: WidthCommand,
      padding: PaddingCommand,
    },
    "Clear the output folder before generating"
  );
  console.log(ui.toString());
}

export function getLogLoadingFun(time: number = 500, text?: string[]) {
  const LoadingText = text || [".", "..", "..."];
  let spinner = LoadingText[0];

  return {
    logLoading: () => {
      return setInterval(() => {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(prolog.italic(`Generating in progress${spinner}`));
        spinner =
          LoadingText[LoadingText.indexOf(spinner) + 1] || LoadingText[0];
      }, time);
    },
    stopLogLoading: (timer: Timer) => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      clearInterval(timer);
    },
  };
}
