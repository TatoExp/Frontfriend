import Docker from 'dockerode';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import * as tar from "tar";
const DockerodeCompose = require('dockerode-compose');

const dockerClient = new Docker();

export async function createNetwork(networkName: string) {
  try {
    const network = await dockerClient.createNetwork({
      Name: networkName,
    });
  } catch {
    // network already exists
  }
}

export async function buildImage(
  imageName: string,
  imagePath: string,
  networkName: string
): Promise<void> {
  const parentDir = imagePath.split('/').slice(0, -1).join('/');
  const tarPath = parentDir + '/' + imageName + '.tar'

  await tar.c({
    gzip: true,
    file: tarPath,
  }, [imagePath])

  const readStream = createReadStream(tarPath);

  const stream = await dockerClient.buildImage(
    readStream,
    {
      t: imageName,
      networkmode: networkName,
    }
  );
  await new Promise((resolve, reject) => {
    dockerClient.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
  });
}

export async function stopAndRemoveContainer(containerName: string) {
  try {
    const existingContainer = dockerClient.getContainer(containerName);
    try {
      await existingContainer.stop();
    } catch {}
    await existingContainer.remove();
    return;
  } catch {
    return;
  }
  
}

export async function createContainer(
  containerName: string,
  imageName: string,
  exposedPort: number,
  hostPort: number
) {
  try {
    await stopAndRemoveContainer(containerName);
  } catch {
    // container does not exist
  }

  const container = await dockerClient.createContainer({
    name: containerName,
    Image: imageName,
    ExposedPorts: {
      [`${exposedPort}/tcp`]: {},
    },
    HostConfig: {
      PortBindings: {
        [`${exposedPort}/tcp`]: [
          {
            HostPort: `${hostPort}`,
          },
        ],
      },
    },
  });

  await container.start();
}

export async function dockerCompose(composeFile: string, projName: string) {
  if (!existsSync(composeFile)) {
    return;
  }
  const dockerCompose = new DockerodeCompose(
    dockerClient,
    composeFile,
    projName
  );
  await dockerCompose.pull();
  await dockerCompose.up();
}
