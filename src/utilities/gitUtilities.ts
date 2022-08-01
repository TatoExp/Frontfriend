import { existsSync } from 'fs';
import simpleGit from 'simple-git';

const git = simpleGit({
  baseDir: process.cwd() + '/' + 'sources',
});

export async function cloneRepo(
  repoName: string,
  repoLink: string,
  repoBranch: string
) {
  const options: any = {
    '-b': null,
    [repoBranch]: null,
  };

  const path = repoName + '/' + repoBranch;

  if (!existsSync(path)) {
    await git.pull('origin', repoBranch);
    return;
  }
  await git.clone(repoLink, path, options);
  return;
}
