import 'reflect-metadata';
import express from 'express';
import simpleGit from 'simple-git';
import { validateConfig } from './configValidator';
import { ValidationError } from 'class-validator';
import { appendFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { DataSource } from 'typeorm';
import { AllocatedPort } from './entities/AllocatedPort';
import { existsSync } from 'fs';
import { httpNginx } from './nginx/http';

const dataSource = new DataSource({
  type: 'sqlite',
  database: './db.sqlite',
  entities: [AllocatedPort],
  synchronize: true,
});

async function bootstrap() {
  const config = await validateConfig(require('../config.json'));
  await dataSource.initialize();

  const app = express();

  const git = simpleGit({
    baseDir: process.cwd() + '/' + 'sources',
  });

  app.post('/deploy/:repo/:branch', async (req, res) => {
    const repoConfig = config.repos.find((r) => r.repoName === req.params.repo);
    if (!repoConfig) {
      res.status(404).send('Repo not found');
      return;
    }

    const options: any = {
      '-b': null,
    };
    options[req.params.branch] = null;

    let path = repoConfig.repoName + '/' + req.params.branch;

    const response = await git.clone(repoConfig.repoLink, path, options);

    path = process.cwd() + '/' + 'sources/' + path;

    if (repoConfig.dockerfile) {
      await writeFile(path + '/Dockerfile', repoConfig.dockerfile);
    }
    if (repoConfig.dockerCompose) {
      await writeFile(path + '/docker-compose.yml', repoConfig.dockerCompose);
    }

    const dockerNames = req.params.branch + '-' + repoConfig.repoName;
    let { port } = await dataSource.manager.save(
      new AllocatedPort(req.params.branch, repoConfig.repoName)
    );
    port = port! + 6000;

    console.log("Creating");
    execSync(`docker network create ${dockerNames}-network`, { cwd: path });

    console.log("Building");
    execSync(`docker build -t ${dockerNames} -f Dockerfile .`, { cwd: path });

    console.log("Running")
    if (existsSync(path + '/docker-compose.yml')) {
      appendFile(
        path + '/docker-compose.yml',
        '\n' +
          `
networks:
  default:
    name: ${dockerNames}-network
    external: true
      `
      );
      execSync('docker-compose up -d', { cwd: path });
    }

    console.log("Running");
    execSync(
      `docker run -d -p ${port}:${repoConfig.port} --network=${dockerNames}-network --name=${dockerNames}-container ${dockerNames}`,
      { cwd: path }
    );
    
    if (!config.ssl) {
      const nginxConfig = httpNginx(
        config.hostname.replace('*', req.params.branch),
        'http://127.0.0.1:' + port
      );
      await writeFile(
        '/etc/nginx/sites-available/' + req.params.branch,
        nginxConfig
      );
      execSync(
        'ln -s /etc/nginx/sites-available/' +
          req.params.branch +
          ' /etc/nginx/sites-enabled/' +
          req.params.branch
      );
      execSync('service nginx reload');
    }
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
