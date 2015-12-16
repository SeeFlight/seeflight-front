# Prerequesites
* Install Git
* Install NodeJS
* Install MongoDB

# Installation
* Clone the repository
```
git clone https://github.com/SeeFlight/seeflight-front.git
```
* Go in the directory created and download and install the node packages
```
cd directory-created-by-git/
npm install
```

# AngularJS configuration

AngularJS needs to be configured via Gulp. A gulpfile is available in the app directory. Go in this directory with
```
cd app/
```
The main task is called 'build'. This task is waiting for an environment variable ENV. Two keys are available :
* 'dev' for development environment
* 'prod' for production environment

Run it to build the main AngularJS configuration
* In dev environment
```
ENV='dev' gulp build
```
* In prod environment
```
ENV='prod' gulp build
```

# Environment configuration

The project is waiting for an environment variable called ENV when running. Two keys are available :
* "dev" for development environment
* "prod" for production environment

# Running application
The application is written in NodeJS, to run it :
* In development mode
```
ENV='dev' node app.js
```
* In production mode
```
ENV='prod' node app.js
```
    
The application is running on the port 8282 in development, 9292 in production
