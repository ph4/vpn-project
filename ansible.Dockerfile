FROM python:3.10-alpine
WORKDIR /app
RUN apk add openssh

RUN pip install ansible

RUN apk add openssl

COPY ssh_key.pub /root/.ssh/authorized_keys
COPY ssh_key /root/.ssh/id_ed25519
RUN chmod 700 /root/.ssh
RUN chmod 600 /root/.ssh/id_ed25519
RUN chmod 600 /root/.ssh/authorized_keys

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

