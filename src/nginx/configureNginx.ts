import { execSync } from 'child_process';
import { writeFile } from 'fs/promises';
import { fileExists } from '../utilities/fileExists';
import { httpNginx } from './http';
import { httpsNginx } from './https';

export async function configureNginx(
  ssl: boolean,
  hostname: string,
  branch: string,
  repoName: string,
  port: number,
  sslCertPath?: string,
  sslKeyPath?: string
) {
  if (await fileExists('/etc/nginx/sites-available/' + repoName + '-' + branch)) {
    return;
  }
  let nginxConfig
  if (!ssl) {
    nginxConfig = httpNginx(
      hostname.replace('*', branch),
      'http://127.0.0.1:' + port
    );
  } else {
    if(!sslCertPath || !sslKeyPath) {
      throw new Error('SSL certificate and key paths are required');
    }
    nginxConfig = httpsNginx(
      hostname.replace('*', branch),
      'http://127.0.0.1:' + port,
      sslCertPath,
      sslKeyPath
    );
  }
  await writeFile('/etc/nginx/sites-available/' + repoName + '-' + branch, nginxConfig);
    execSync(
      'ln -s /etc/nginx/sites-available/'  + repoName + '-' + branch +
        ' /etc/nginx/sites-enabled/' +
        + repoName + '-' + branch
    );
    execSync('service nginx reload');
}
