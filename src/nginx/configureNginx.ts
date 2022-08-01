import { execSync } from "child_process";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { httpNginx } from "./http";

export async function configureNginx(ssl: boolean, hostname: string, branch: string, port: number) {
	if(existsSync('/etc/nginx/sites-available/' + branch)) {
		return;
	}
	if (!ssl) {
		const nginxConfig = httpNginx(
			hostname.replace('*', branch),
			'http://127.0.0.1:' + port
		);
		await writeFile('/etc/nginx/sites-available/' + branch, nginxConfig);
		execSync(
			'ln -s /etc/nginx/sites-available/' +
				branch +
				' /etc/nginx/sites-enabled/' +
				branch
		);
		execSync('service nginx reload');
	}
}