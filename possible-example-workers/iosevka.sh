#!/bin/bash

# Set variables
URL="https://github.com/be5invis/Iosevka/releases/download/v33.3.1/PkgTTC-Iosevka-33.3.1.zip"
DEST="$HOME/Downloads/PkgTTC-Iosevka-33.3.1.zip"

# Download the file
curl -L -o "$DEST" "$URL"

# Open the Downloads folder in Finder
open "$HOME/Downloads"