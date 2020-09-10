# Assemblyline UI Frontend

This repo is dedicated for the new version off Assemblyline 4 UI. It uses React as the framework and Material UI for the visual components.

## Install dev environment pre-requisites

### Install NodeJS (Ubuntu)

Follow these simple command to get NodeJS installed

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install -y nodejs

### Install NPM dependencies

Go to your `assemblyline-ui-frontend` directory and type:

    npm install

### Install docker (Ubuntu)

Follow these simple commands to get Docker running on your machine:

    # Add Docker repository
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo apt-key fingerprint 0EBFCD88
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    # Install Docker
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io

    # Test Docker installation
    sudo docker run hello-world

### Install docker-compose

Installing docker-compose is done the same way on all Linux distros. Follow these simple instructions:

    # Install docker-compose
    sudo curl -L "https://github.com/docker/compose/releases/download/1.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    # Test docker-compose installation
    docker-compose --version

For reference, here are the instructions on Docker’s website: <https://docs.docker.com/compose/install/>

## Configure the dev environment

### Setup Webpack for debugging behing a proxy

Create a file named `.env.local` at the root of the assemblyline-ui-frontend directory.

The file should only contain the following where `<YOUR_IP>` is replaced by your dev computer IP.

    HOST=<YOUR_IP>.nip.io

### Setup docker compose environment

#### Setup IP routing

Create a file in the `docker` directory named `.env`.

This file should only contain the following where `<YOUR_IP>` is replaced by your dev computer IP.

    EXTERNAL_IP=<YOUR_IP>

#### Setup Assemblyline config file

From the `docker` directory, copy the file `config.yml.template` to `config.yml` in the same directory.

Change the `<YOUR_IP>` in the newly created `config.yml`file to the IP of your dev machine.

## Launch the dev environment

### Dependencies

Go to the `docker` directory and run the following command to launch the Assemblyline DB and UI.

    docker-compose up

### Frontend

Simply use the `npm start script` to launch the frontend.

### Once dependencies and frontend started

Access the dev frontend at the following link: `https://<YOUR_IP>.nip.io`
