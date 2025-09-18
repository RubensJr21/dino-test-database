# lista distros e versão WSL
wsl --list --verbose

# se precisar forçar WSL2 como padrão
wsl --set-default-version 2

# (opcional) instalar Ubuntu 24.04 se não tiver
wsl --install -d Ubuntu-24.04

wsl -d Ubuntu-24.04