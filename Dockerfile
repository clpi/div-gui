FROM ubuntu:19.10

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y libwebkit2gtk-4.0-dev build-essential curl libssl-dev gnupg
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get -y install nodejs
ENV PATH="/root/.cargo/bin:${PATH}"
RUN cargo install tauri-bundler --force
RUN cargo install tauri-cli --force
RUN npm install --unsafe-perm -g tauri
WORKDIR /root/app
CMD ["npm", "run", "dev"]
CMD ["npm", "run", "tauri", "dev"]
