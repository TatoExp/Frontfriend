export const httpNginx = (server_name: string, proxy_pass: string) => {
  return `
	server {
		listen 80;
		listen [::]:80;
		server_name ${server_name};
	
		location / {
			proxy_pass ${proxy_pass};
		}
	}
	`;
};
