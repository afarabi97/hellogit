all: $(patsubst %.Dockerfile,build-stamp_%,$(wildcard *.Dockerfile))

build-stamp_%: %.Dockerfile
	docker build -t tfplenum/zeek:$(*) -f $< .
	touch $@

push-stamp_%: build-stamp_%
	docker push tfplenum/zeek:$(*)
	touch $@

push_all: $(patsubst %.Dockerfile,push-stamp_%,$(wildcard *.Dockerfile))
