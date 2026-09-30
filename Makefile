REGISTRY = corncorn0505
RELEASE_VERSION = release
TAG_VERSION = $(shell git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
commit_id = $(shell git rev-parse --short=7 HEAD)

# -- LOCAL DEV --------------------------------------------------
up: clean build
build:
	docker compose up --build
clean:
	docker compose down

# -- RELEASE ------------------------------------------------------
release:
	@echo "REGISTRY=${REGISTRY}" > .env
	@echo "VERSION=${RELEASE_VERSION}-${TAG_VERSION}-${commit_id}" >> .env
	docker compose -f docker-compose-build.yaml build \
		--parallel \
		--build-arg NGINX_CONF=nginx_release.conf
	echo "$$DOCKER_HUB_ACCESS_TOKEN" | docker login -u "$$DOCKER_HUB_USERNAME" --password-stdin
	docker compose -f docker-compose-build.yaml push

.PHONY: clean up build release
