# trunk-ignore-all(trivy/DS026)
# trunk-ignore-all(trivy/DS002)
# Use Python 3.11-slim as a parent image
FROM python:3.11-slim

# Set the working directory in the container to /app
WORKDIR /app

# Define arguments
ARG VERSION=1.0.0

# Copy the current directory contents into the container at /app
COPY ./ /app

# Install apt dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
  && rm -rf /var/lib/apt/lists/*

# Install Poetry
# trunk-ignore(hadolint/DL3013)
RUN pip install --no-cache-dir poetry

# Install project dependencies using Poetry
RUN poetry config virtualenvs.create false \
  && poetry install --no-dev

# Move to the project directory
# USERS MUST MOUNT THE PROJECT DIRECTORY TO /tfplenum in order for this to work
WORKDIR /tfplenum

# Run changelog when the container launches
ENTRYPOINT ["changelog"]
