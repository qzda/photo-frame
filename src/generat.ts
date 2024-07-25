import kleur from "kleur";

export function generat(i: string, o: string) {
  return new Promise(async (resolve, reject) => {
    const LoadingText = [".", "..", "..."];
    let spinner = LoadingText[0];
    const intervalId = setInterval(() => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(kleur.gray(`Generating in progress${spinner}`));
      spinner = LoadingText[LoadingText.indexOf(spinner) + 1] || LoadingText[0];
    }, 250);

    try {
      await delayResolve(2000); // todo
      clearInterval(intervalId);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.log(kleur.green("Generation complete"));
      resolve(null);
    } catch (error) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      console.error(error);
      reject();
    }
  });
}

function delayResolve(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}
