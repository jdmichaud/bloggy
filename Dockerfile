FROM ubuntu:xenial

RUN apt update
RUN apt install -y curl xz-utils less
# Install node/npm
RUN cd /root && \
  curl -sOL https://nodejs.org/dist/v8.9.3/node-v8.9.3-linux-x64.tar.xz && \
  tar xf node-v8.9.3-linux-x64.tar.xz && \
  (export PATH=$PATH:/root/node-v8.9.3-linux-x64/bin; npm install -g n) && \
  (export PATH=$PATH:/root/node-v8.9.3-linux-x64/bin; n 8.9.4) && \
  npm update -g npm && \
  rm -fr node-v8.9.3-linux-x64 node-v8.9.3-linux-x64.tar.xz
# Install java for PlantUML
RUN apt install -y default-jre
# Download PlantUML
RUN curl -sL https://downloads.sourceforge.net/project/plantuml/1.2018.2/plantuml.1.2018.2.jar --output /root/plantuml.jar
# Copy the project in the container
COPY . /root/bloggy/
# build the project
RUN cd /root/bloggy && npm install

EXPOSE 80/tcp

# Start the express server when container is started
CMD node /root/bloggy/index.js
