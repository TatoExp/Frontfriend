import Docker from 'dockerode';
import { existsSync } from 'fs';
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
	networkName: string,
): Promise<void> {
  await dockerClient.buildImage(
    {
      context: imagePath,
      src: ['Dockerfile'],
    },
    {
      t: imageName,
			networkmode: networkName,
    }
  );
}

export async function stopAndRemoveContainer(
  containerName: string
) {
  const existingContainer = dockerClient.getContainer(containerName);
  await existingContainer.stop();
  await existingContainer.remove();
  return;
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
      }
    }
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
