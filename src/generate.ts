import { readdir } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import Exif from "exif";
import cliui from "cliui";
import { getPhotoExif } from "./img";
import { getFullPath } from "../utils";
import sharp from 'sharp';
import fs from 'fs';

interface Photo {
  name: string;
  fullPath: string;
  exif?: Exif.ExifData;
  err?: Error;
}

export function generate(i: string, o: string) {
  const inputPath = getFullPath(i);
  const outputPath = getFullPath(o);
  console.log(outputPath);

  return new Promise(async (resolve) => {
    const LoadingText = [".", "..", "...", "....", ".....", "......"];
    let spinner = LoadingText[0];
    const loadingTextIntervalId = setInterval(() => {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(chalk.gray(`Generating in progress${spinner}`));
      spinner = LoadingText[LoadingText.indexOf(spinner) + 1] || LoadingText[0];
    }, 200);

    function stopLoading() {
      clearInterval(loadingTextIntervalId);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }

    try {
      // Make sure the folder exists
      await readdir(outputPath);

      const photos: Photo[] = (await readdir(inputPath))
        .filter(
          (file) =>
            /\.(jpg|jpeg|heic)$/i.test(file) && file === encodeURIComponent(file)
        )
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

          // todo 生成图片
          generatePhoto(photo)
        })
      );
      stopLoading();
      console.log(chalk.green("Generation complete"));

      const ui = cliui({ width: 80 });
      ui.div({
        text: chalk.bold("Result:"),
        padding: [1, 0, 0, 0],
      });
      // console.log(photos.map(it => it.exif));
      photos.forEach((photo) => {
        ui.div(
          {
            text: photo.name,
            width: 30,
            padding: [0, 2, 0, 2],
          },
          {
            text: photo.err
              ? chalk.red(photo.err.message)
              : `${chalk.green("Success")}`,
            padding: [0, 1, 0, 0],
            width: photo.err ? 50 : 8,
          },
          {
            text: photo.exif
              ? chalk.gray(
                  `${photo.exif.image.Model || ""} ${
                    photo.exif.exif.FNumber ? `f${photo.exif.exif.FNumber}` : ""
                  } ${
                    photo.exif.exif.ISO ? `ISO ${photo.exif.exif.ISO}` : ""
                  }`.trim()
                )
              : "",
            padding: [0, 0, 0, 0],
            width: 42,
          }
        );
      });
      console.log(ui.toString());

      resolve(null);
    } catch (error) {
      stopLoading();
      console.log(chalk.red("Generation error"));
      console.error(error);
      resolve(null);
    }
  });
}

// 生成图片
async function generatePhoto(photo: Photo) {
  const newPhoto = await (await addPhotoFrame(photo)).toBuffer()
  // 将这个bg生成图片到output目录下
  fs.writeFileSync(path.join('output', photo.name), newPhoto)
}

async function addPhotoFrame(photo: Photo) {
  const _photoBuffer = await sharp(photo.fullPath).resize(400).toBuffer()
  const frame = await generatePhotoFrame(600, 600)
  const newPhoto = await frame.composite([
    { input: _photoBuffer,  }
  ]).png()
  
  return newPhoto
}

async function generatePhotoFrame(
  width: number, 
  height: number, 
  background: {r: number, g: number, b: number, alpha: number} = { r: 255, g: 255, b: 255, alpha: 1 }
) {
  const frame = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    }
  })
  return frame
}