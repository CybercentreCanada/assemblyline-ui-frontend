# Assemblyline UI Frontend

This repo is dedicated for the new version off Assemblyline 4 UI. It uses React as the framework and Material UI for the visual components.

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
