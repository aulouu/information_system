all: back minio

back:
	cd backend && mvn spring-boot:run -X

front:
	cd frontend && npm run dev

minio:
	cd minio-data && minio server . --console-address :9001

k6:
	k6 run ./src/main/resources/scripts/script.js

.PHONY: back front minio k6
