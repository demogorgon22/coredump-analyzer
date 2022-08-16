#FROM node:16-alpine3.15
FROM alpine

RUN apk update

RUN apk add gdb ncurses-dev libc-dev nodejs npm openssh-server

WORKDIR /app

COPY . /app

RUN npm install

RUN sed -i -e "s/bin\/ash/app\/launch.sh/" /etc/passwd

COPY sshd_config /etc/ssh/sshd_config

COPY .gdbinit /root/.gdbinit

CMD /app/init.sh
