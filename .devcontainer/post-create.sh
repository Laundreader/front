#!/usr/bin/env bash

# alias 등록 (bash 프로파일에 추가)
echo -e "\nalias pn='pnpm' pnx='pnpm dlx'" >> ~/.bashrc

# nvm 환경 변수 로드 및 Node.js LTS 버전 설치 
# https://github.com/devcontainers/features/blob/main/src/node/README.md#using-nvm-from-postcreatecommand-or-another-lifecycle-command
. ${NVM_DIR}/nvm.sh && nvm install --lts

# 작업 디렉토리로 이동
cd /workspaces/laundreader

# 인증서 저장 폴더가 없으면 생성
mkdir -p ./cert

# mkcert로 localhost 및 IP에 대한 인증서 생성
mkcert -key-file ./cert/key.pem -cert-file ./cert/cert.pem localhost 192.168.35.79
