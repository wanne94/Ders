#!/bin/bash

# Set Android SDK environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin

# Set Java environment
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH

# Create local.properties if it doesn't exist
if [ ! -f android/local.properties ]; then
  echo "sdk.dir=$ANDROID_HOME" > android/local.properties
  echo "Created android/local.properties with SDK path"
fi

echo "Android SDK configured at: $ANDROID_HOME"
echo "Java configured at: $JAVA_HOME"