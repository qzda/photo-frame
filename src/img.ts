import Exif from "exif";

export function getPhotoExif(path: string): Promise<{
  data: Exif.ExifData;
  err: Error | null;
}> {
  return new Promise(
    (resolve) =>
      new Exif(path, (err, data) => {
        resolve({ data, err });
      })
  );
}
