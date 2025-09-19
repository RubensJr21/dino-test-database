# Verifique se sua distro WSL está com systemd (WSL moderno/Windows 11 permite):
ps -p 1 -o comm=

# Se o resultado for systemd → use:
sudo systemctl enable --now docker

# Se não tiver systemd → rode o daemon manualmente (ex.: sessão atual):
# inicia o daemon em background (use essa linha se não tiver systemd)
sudo nohup dockerd > /tmp/dockerd.log 2>&1 &

# aguarde 1-2s e verifique
sleep(2000)
docker version

sudo usermod -aG docker $USER
# saia e entre novamente na sessão do WSL, ou faça:
newgrp docker