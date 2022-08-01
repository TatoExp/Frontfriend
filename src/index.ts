import 'reflect-metadata';
import express from 'express';
import { validateConfig } from './configValidator';
import { ValidationError } from 'class-validator';
import { appendFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { DataSource } from 'typeorm';
import { AllocatedPort } from './entities/AllocatedPort';
import { existsSync } from 'fs';
import { httpNginx } from './nginx/http';
import {
  buildImage,
  createContainer,
  createNetwork,
  dockerCompose,
  stopAndRemoveContainer,
} from './utilities/dockerUtils';
import { configureDockerfiles } from './utilities/configureDockerfiles';
import { cloneRepo } from './utilities/gitUtilities';
import { getAllocatedPort } from './utilities/getAllocatedPort';
import { configureNginx } from './nginx/configureNginx';

export const dataSource = new DataSource({
  type: 'sqlite',
  database: './db.sqlite',
  entities: [AllocatedPort],
  synchronize: true,
});

async function bootstrap() {
  const config = await validateConfig(require('../config.json'));
  await dataSource.initialize();

  const app = express();

  app.post('/deploy/:repo/:branch', async (req, res) => {
    const repoConfig = config.repos.find((r) => r.repoName === req.params.repo);
    if (!repoConfig) {
      res.status(404).send('Repo not found');
      return;
    }

    const { ssl, hostname } = config;
    const { repoName, repoLink, port: repoPort } = repoConfig;
    const { branch } = req.params;

    const dockerNames = branch + '-' + repoName;

    await stopAndRemoveContainer(`${dockerNames}-container`);
    await cloneRepo(repoName, repoLink, branch);

    const path = process.cwd() + '/' + 'sources/' + repoName + '/' + branch;
    const port = await getAllocatedPort(branch, repoName);

    await configureDockerfiles(path, repoConfig, dockerNames);
    await createNetwork(`${dockerNames}-network`);
    await buildImage(dockerNames, path, `${dockerNames}-network`);
    await dockerCompose(path + '/docker-compose.yml', dockerNames);

    await createContainer(
      `${dockerNames}-container`,
      dockerNames,
      port,
      repoPort
    );

    await configureNginx(ssl, hostname, branch, port);
  });

  app.listen(3000, () => {
    console.log(`Server started on port 3000`);
  });
}

bootstrap().catch((err) => {
  console.log(err);
  console.log(JSON.stringify(err));
  if (err instanceof ValidationError) {
    console.log(err.children);
  }
});
