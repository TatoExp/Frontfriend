import simpleGit from 'simple-git';
import { fileExists } from './fileExists';

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

  if (await fileExists(process.cwd() + '/' + 'sources/' + path)) {
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
