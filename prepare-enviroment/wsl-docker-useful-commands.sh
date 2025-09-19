docker compose up -d        # sobe os serviços
docker compose logs -f     # ver logs
docker compose down -v     # derruba e remove volumes (se quiser)

docker compose down --rmi all -v --remove-orphans

docker system prune

docker ps
docker logs postgres-db
docker exec -it postgres-db psql -U usuario -d meubanco   # psql dentro do container
docker stop postgres-db && docker start postgres-db
docker volume ls
docker network ls

# Para exportar backup via pg_dumpall:
docker exec -t postgres-db pg_dumpall -c -U usuario > ~/backup_all.sql