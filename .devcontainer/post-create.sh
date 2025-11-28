#!/bin/bash
set -euo pipefail

# Install apt packages
sudo apt-get update
sudo apt-get install -y libgtest-dev clang-format

# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH for this script
export PATH="$HOME/.local/bin:$PATH"

# Install Python dependencies
uv sync --locked --extra dev

# Install Node.js dependencies
npm ci

# Install emscripten to a persistent location
EMSDK_DIR="$HOME/emsdk"
if [ ! -d "$EMSDK_DIR" ]; then
    git clone https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
fi
(
    cd "$EMSDK_DIR"
    ./emsdk install latest
    ./emsdk activate latest
)

# Add emsdk to shell config for future sessions
echo "source $EMSDK_DIR/emsdk_env.sh" >> "$HOME/.bashrc"

# Install pre-commit hooks
uv run pre-commit install
