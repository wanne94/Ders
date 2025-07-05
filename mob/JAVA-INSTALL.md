# Java JDK Instalacija

Build je prekinut jer Java JDK nije instaliran.

## Brza instalacija (potreban sudo)

```bash
sudo apt update && sudo apt install -y openjdk-17-jdk
```

## Alternativno: Ručna instalacija bez sudo

1. Preuzmite OpenJDK 17:
```bash
cd ~
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz
```

2. Raspakovati:
```bash
tar -xzf openjdk-17.0.2_linux-x64_bin.tar.gz
```

3. Postaviti environment varijable:
```bash
echo 'export JAVA_HOME=~/jdk-17.0.2' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

4. Proverite instalaciju:
```bash
java -version
javac -version
```

## Zatim pokrenite build ponovo:
```bash
npm run build:prod
```