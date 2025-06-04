#!/bin/bash
mkdir -p out
javac -d out src/Main.java
if [ $? -eq 0 ]; then
  java -cp out Main
else
  echo "Compilazione fallita"
fi
