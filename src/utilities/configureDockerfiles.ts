import { existsSync } from 'fs';
import { readFile, writeFile, appendFile } from 'fs/promises';
import { RepoConfig } from '../models/config';

export async function configureDockerfiles(
  basePath: string,
  repoConfig: RepoConfig,
  dockerNames: string
) {
  if (repoConfig.dockerfile) {
    if (existsSync(repoConfig.dockerfile)) {
      const data = await readFile(repoConfig.dockerfile, 'utf8');
      await writeFile(basePath + '/Dockerfile', data);
    } else {
      await writeFile(basePath + '/Dockerfile', repoConfig.dockerfile);
    }
  }
  if (repoConfig.dockerCompose) {
    if (existsSync(repoConfig.dockerCompose)) {
      const data = await readFile(repoConfig.dockerCompose, 'utf8');
      await writeFile(basePath + '/docker-compose.yml', data);
    } else {
      await writeFile(
        basePath + '/docker-compose.yml',
        repoConfig.dockerCompose
      );
    }
  }

  if (existsSync(basePath + '/docker-compose.yml')) {
    await appendFile(
      basePath + '/docker-compose.yml',
      '\n' +
        `
networks:
	default:
		name: ${dockerNames}-network
		external: true
		`
    );
  }
}
