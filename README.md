# Frontfriend
Frontfriend is a tool to help deploy development infrastructure quicker and easier in a self-hosted environment.

It works by integrating with git, and dockerising your code, even if there is no dockerfile in the repository.

Frontfriend is a play on Front-end, as this software was primarily designed to help bridge the gap between Back-end and Front-end developers, and to avoid pushing development branches to staging or live environments.

Currently this only officially supports Ubuntu, but will likely work on other debian based OS. PR's are welcome to make it more versatile.

## Install

1. Clone Frontfriend
```
git clone https://github.com/TatoExp/Frontfriend.git
```
2. Install nginx
```
sudo apt updated
sudo apt install nginx
```
3. Install the latest docker version https://docs.docker.com/engine/install/ubuntu/
4. Install NodeJS 16.16.0 and Yarn 1.22.19 (NOTE: Other versions are not officially supported, please don't open any issues unless you have tried these SPECIFIC versions.) We recommend [Volta](https://volta.sh/).

## Configuration
See example.config.json for an example.
```json
{
	//This must be a wildcard DNS to your website, subdomains also work.
	"hostname": "*.yoursite.com", 
	//Whether to use HTTPS or not.
	"ssl": false,
	//Paths to SSL Certificate and SSL private key, only required if ssl is true
	"sslCertificate": "",
	"sslKey": "",
	//An array of supported repositories
	"repos": [
		{
			//A link to your repository, we recommend setting up ssh authentication for private repos
			"repoLink": "https://github.com/jatins/express-hello-world",
			//The name of your repository, used in API requests to deploy
			"repoName": "express-hello-world",
			//This is not external port, this is what internal port your service listens on.
			"port": 3000,
			//A link to or content of a dockerfile, leave blank if your repo already has one
			"dockerfile": false,

			//A link to or content of a docker-compose.yml, leave blank if your repo already has one, or doesn't need one.
			"dockerCompose": false,
		}
	]
	
}
```

## Usage
Use a POST request to initiate the deployment e.g.
```
curl --request POST \
  --url http://localhost:3000/deploy/<repo-name>/<branch-name>

-- {
--   "success": true,
--   "message": "Deployed at <branch-name>.yoursite.com"
-- }
```