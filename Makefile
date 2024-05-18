# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=-T
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = pages
BUILDDIR      = _build

.PHONY: serve
serve:
	live-server _build/html

.PHONY: continuous
continuous:
	fd . | entr fish -c 'make html'

.PHONY: html
html:
	@$(SPHINXBUILD) -M html "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS)
	mkdir -p $(BUILDDIR)/html/_static/vis
	cp -r vis/js $(BUILDDIR)/html/_static/vis/js

.PHONY: clean
clean:
	rm -rf $(BUILDDIR)/*
