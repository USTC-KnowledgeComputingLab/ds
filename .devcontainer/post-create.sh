#!/bin/bash
set -euo pipefail

# Install apt packages
sudo apt-get update
sudo apt-get install -y libgtest-dev clang-format

# Install Python dependencies (uv is installed via devcontainer feature)
uv sync --locked --extra dev

# Install Node.js dependencies
npm ci

# Install pre-commit hooks
uv run pre-commit install
