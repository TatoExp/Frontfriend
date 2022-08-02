export const httpsNginx = (server_name: string, proxy_pass: string, certificatePath: string, keyPath: string) => {
  return `
	server {
		listen 443 ssl;
		listen [::]:443 ssl;
		server_name ${server_name};
		ssl_certificate     ${certificatePath};
    ssl_certificate_key ${keyPath};
    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers         HIGH:!aNULL:!MD5;
	
		location / {
			proxy_pass ${proxy_pass};
		}
	}
	`;
};
