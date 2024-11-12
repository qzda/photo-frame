import { readdir } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";
import Exif from "exif";
import prolog from "@qzda/prolog";
import cliui from "cliui";
import sharp from "sharp";

import { getPhotoExif } from "./img";
import { getFullPath, msToExifTime } from "../utils";
import { getLogLoadingFun } from "./logs";

interface Photo {
  name: string;
  fullPath: string;
  exif?: Exif.ExifData;
  err?: Error;
  done?: boolean;
}

export function generate(
  i: string,
  o: string,
  config?: {
    clear: boolean;
  }
) {
  const inputPath = getFullPath(i);
  const outputPath = getFullPath(o);

  return new Promise(async (resolve) => {
    const { logLoading, stopLogLoading } = getLogLoadingFun();
    const timer = logLoading();

    try {
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      if (config?.clear) {
        fs.rmSync(outputPath, { recursive: true, force: true });
        fs.mkdirSync(outputPath, { recursive: true });
      }

      const photos: Photo[] = (await readdir(inputPath))
        .filter((file) => /\.(jpg|jpeg|heic)$/i.test(file))
        .map((file) => ({
          name: file,
          fullPath: path.join(inputPath, file),
        }));

      // get all photos exif and generate
      await Promise.all(
        photos.map(async (photo) => {
          const res = await getPhotoExif(photo.fullPath);
          const { data, err } = res;
          if (err) {
            photo.err = err;
          } else {
            photo.exif = data;
            generatePhoto(photo, outputPath, {
              zoom: [1.2, 1.2],
              background: [255, 255, 255, 1],
              fit: "contain",
            })
              .then(() => {
                photo.done = true;
              })
              .catch((err) => {
                photo.done = true;
                photo.err = err;
              });
          }
        })
      );

      // wait for all photos to be done
      const generateTimer = setInterval(() => {
        if (
          photos.every((photo) => {
            if (photo.exif) {
              return photo.done;
            } else {
              return true;
            }
          })
        ) {
          stopLogLoading(timer);
          clearInterval(generateTimer);

          // log result
          console.log(prolog.green("Generate done"));
          const ui = cliui({ width: 80 });
          ui.div({
            text: prolog.bold("Result:"),
            padding: [1, 0, 0, 0],
          });
          photos.forEach((photo) => {
            ui.div(
              {
                text: photo.name,
                width: 30,
                padding: [0, 2, 0, 2],
              },
              {
                text: photo.exif
                  ? prolog.blue(
                      `${photo.exif.image.Model || "Model"} | ${
                        photo.exif.exif.FNumber
                          ? `F${photo.exif.exif.FNumber}`
                          : "FNumber"
                      } | ${
                        photo.exif.exif.ExposureTime
                          ? `${msToExifTime(photo.exif.exif.ExposureTime)}`
                          : "ExposureTime"
                      } | ${
                        photo.exif.exif.ISO
                          ? `ISO ${photo.exif.exif.ISO}`
                          : "ISO"
                      }`.trim()
                    )
                  : photo.err
                  ? prolog.red(photo.err.message)
                  : "",
                padding: [0, 0, 0, 0],
                width: 42,
              }
            );
          });
          console.log(ui.toString());

          resolve(null);
        }
      }, 500);
    } catch (error) {
      stopLogLoading(timer);
      console.log(prolog.red("Generation error"));
      console.error(error);
      resolve(null);
    }
  });
}

async function generatePhoto(
  photo: Photo,
  outputPath: string,
  config: {
    /** zoom x, y */
    zoom: [number, number];
    /** rgba */
    background: [number, number, number, number];
    position?: string | number;
    fit?: keyof sharp.FitEnum;
  }
) {
  async function addPhotoFrame(photo: Photo): Promise<sharp.Sharp> {
    return new Promise(async (resolve, reject) => {
      const originalImage = sharp(photo.fullPath);
      const { width, height } = await originalImage.metadata();

      if (!width || !height) {
        reject(new Error("Image width or height is not found"));
        return;
      }

      const frame = sharp({
        create: {
          width: Math.round(width * config.zoom[0]),
          height: Math.round(height * config.zoom[1]),
          channels: 4,
          background: {
            r: config.background[0],
            g: config.background[1],
            b: config.background[2],
            alpha: config.background[3],
          },
        },
      });

      const _photoBuffer = await originalImage
        .resize(
          Math.round(width / config.zoom[0]),
          Math.round(height / config.zoom[1]),
          {
            fit: config.fit,
            position: config.position,
          }
        )
        .toBuffer();

      const newPhoto = frame.composite([{ input: _photoBuffer }]).jpeg();

      resolve(newPhoto);
    });
  }

  return new Promise(async (resolve, reject) => {
    await addPhotoFrame(photo)
      .then(async (res) => {
        const newPhoto = await res.toBuffer();
        fs.writeFileSync(path.join(outputPath, photo.name), newPhoto);
        resolve(null);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
