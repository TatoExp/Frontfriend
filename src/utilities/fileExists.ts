import { stat } from 'fs/promises';

export function fileExists(path: string) {
  return stat(path)
    .then(() => true)
    .catch(() => false);
}
