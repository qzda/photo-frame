import { readdir } from "node:fs/promises";
import path from "node:path";
import kleur from "kleur";
import Exif from "exif";

interface Photo {
  name: string;
  fullPath: string;
  exif?: Exif.ExifData;
  err?: Error;
}

export function generate(i: string, o: string) {
  const inputPath = (
    i.startsWith("~") && process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, i.replace("~", ""))
      : i
  ).replaceAll("\\", "/");

  return new Promise(async (resolve, reject) => {
    const LoadingText = [".", "..", "..."];
    let spinner = LoadingText[0];
    const loadingTextIntervalId = setInterval(() => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(kleur.gray(`Generating in progress${spinner}`));
      spinner = LoadingText[LoadingText.indexOf(spinner) + 1] || LoadingText[0];
    }, 250);

    try {
      const photos: Photo[] = (await readdir(inputPath))
        .filter((file) => /\.(jpg|jpeg)$/i.test(file))
        .map((file) => ({
          name: file,
          fullPath: path.join(inputPath, file),
        }));

      // get all photos exif
      await Promise.all(
        photos.map(async (photo) => {
          const res = await getPhotoExif(photo.fullPath);
          const { data, err } = res;
          if (err) {
            photo.err = err;
          } else {
            photo.exif = data;
          }
        })
      );
      clearInterval(loadingTextIntervalId);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      // console.log(photos.filter((photo) => photo.exif));
      photos.forEach((p) => console.log(p.exif));
      // todo: 完成情况
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

function getPhotoExif(path: string): Promise<{
  data: Exif.ExifData;
  err: Error | null;
}> {
  return new Promise(
    (resolve) =>
      new Exif(path, (err, data) => {
        resolve({
          data,
          err,
        });
      })
  );
}
