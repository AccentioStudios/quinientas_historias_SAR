#!/bin/bash

# Script que realiza operaciones con git y Docker

# Mostrar el estado de los cambios en el repositorio git
git status

# Actualizar el repositorio git con los cambios remotos
git pull

# Detener los contenedores de Docker y luego iniciarlos con Docker Compose
sudo docker-compose stop && sudo docker-compose up -d --build