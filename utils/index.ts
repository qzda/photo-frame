import path from "node:path";

export function getFullPath(_path: string) {
  if (_path.startsWith("~") && process.env.USERPROFILE) {
    return path.join(process.env.USERPROFILE, _path.replace("~", ""));
  }

  if (_path.startsWith(".")) {
    return path.join(process.cwd(), _path.replace("~", ""));
  }

  return _path;
}

export function delayResolve(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

/** converted milliseconds to 1/n seconds */
export function msToExifTime(ms: number) {
  // todo 待验证
  return `1/${Math.round(1 / 0.0017064846416382253 / 100) * 10}s`;
}
