FROM mcr.microsoft.com/devcontainers/base:noble

RUN sudo apt update && \
    sudo apt full-upgrade -y && \
    sudo apt autoremove -y && \
    sudo apt install -y libnss3-tools && \
    curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" && \
    chmod +x mkcert-v*-linux-amd64 && \
    sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert && \
    mkcert -install && \
    # 루트 CA 확인 및 OS 신뢰 저장소에 복사
    sudo cp $(mkcert -CAROOT)/rootCA.pem /usr/local/share/ca-certificates/mkcert-root-ca.crt && \
    sudo update-ca-certificates
