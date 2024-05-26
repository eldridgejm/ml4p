.PHONY: preview
preview:
	genfig js make-preview
	cd ../.. && live-server --open="figures/$(shell basename $(shell pwd))/_build/preview-dynamic.html"

.PHONY: static
static:
	genfig js generate-static

.PHONY: clean
clean:
	rm -rf _build
