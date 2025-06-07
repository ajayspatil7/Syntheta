.PHONY: dev-init dev-up dev-down db-migrate db-reset

dev-init: dev-down dev-up db-migrate
	@echo "✅ Dev environment initialized."

dev-up:
	docker-compose up -d --build

dev-down:
	docker-compose down -v

db-migrate:
	docker-compose exec backend alembic upgrade head

db-reset:
	docker-compose down -v
	find . -path "*/migrations/versions/*.py" -delete
	docker-compose up -d --build
	docker-compose exec backend alembic revision --autogenerate -m "initial"
	docker-compose exec backend alembic upgrade head