FROM python:3.10-alpine

RUN apk add openssh
RUN apk add openrc

RUN cat > /etc/init.d/dev <<'EOF'
#!/sbin/openrc-run description="Dev service stub — should never start"
depend() { :; }
start() { echo "ERROR: dev service should never start!" >&2; exit 1; }
stop()  { :; }
EOF
RUN chmod +x /etc/init.d/dev

COPY ssh_key.pub /root/.ssh/authorized_keys
RUN chmod 600 /root/.ssh/authorized_keys

RUN ssh-keygen -A

RUN rc-update add sshd

CMD ["/sbin/init"]

