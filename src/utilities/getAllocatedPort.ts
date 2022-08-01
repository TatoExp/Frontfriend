import { dataSource } from '..';
import { AllocatedPort } from '../entities/AllocatedPort';

export async function getAllocatedPort(branchName: string, repoName: string) {
  const existing = await dataSource.manager.findOne(AllocatedPort, {
    where: {
      branch: branchName,
      repo: repoName,
    },
  });
  if (existing) {
    return existing.port! + 6000;
  }

  let { port } = await new AllocatedPort(branchName, repoName).save();
  return port! + 6000;
}
