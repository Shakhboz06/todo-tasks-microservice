.PHONY: up down all

up:
	docker-compose up -d --build

down:
	docker-compose down

all: up
	cd user-service && npm run migrate
	cd todo-service && npm run migrate
