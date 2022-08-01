import { existsSync } from 'fs';
import simpleGit from 'simple-git';

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

  if (existsSync(process.cwd() + '/' + 'sources/' + path)) {
    const git = simpleGit({
      baseDir: process.cwd() + '/' + 'sources/' + path,
    });
    await git.pull('origin', repoBranch);
    return;
  }

  const git = simpleGit({
    baseDir: process.cwd() + '/' + 'sources',
  });
  await git.clone(repoLink, path, options);
  return;
}
