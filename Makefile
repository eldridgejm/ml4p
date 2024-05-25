# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=-T
SPHINXBUILD   ?= sphinx-build
SOURCEDIR     = book
BUILDDIR      = _build


.PHONY: develop
develop:
	develop

.PHONY: html
html:
	@$(SPHINXBUILD) -M html "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS)
	mkdir -p $(BUILDDIR)/html/_static/vis
	cp -r vis/js $(BUILDDIR)/html/_static/vis

.PHONY: clean
clean:
	rm -rf $(BUILDDIR)/*

.PHONY: really-clean
really-clean: clean
	git clean -xfd
