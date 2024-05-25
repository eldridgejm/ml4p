{
  inputs.nixpkgs.url = github:NixOS/nixpkgs/nixos-23.11;

  outputs = {
    self,
    nixpkgs,
  }: let
    supportedSystems = ["x86_64-linux" "aarch64-darwin" "x86_64-darwin"];
    forAllSystems = f: nixpkgs.lib.genAttrs supportedSystems (system: f system);
  in {
    devShell = forAllSystems (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in
        pkgs.mkShell {
          buildInputs = [
            # python environment
            (
              pkgs.python3.withPackages (p: [
                p.numpy
                p.matplotlib
                p.pandas
                p.ipython
                p.scikit-learn
                p.notebook
                p.sphinx
                p.selenium
                p.pillow
                p.rich
                p.sphinx_rtd_theme
                p.sphinxcontrib-katex

                # sphinx-js
                (
                  pkgs.python3.pkgs.buildPythonPackage rec {
                    pname = "sphinx-js";
                    version = "3.2.2";
                    src = pkgs.fetchPypi {
                      inherit pname version;
                      sha256 = "sha256-njEFmU3Qqm0yV7i0GV3KOOM1siO/KNvshpnxtiS1WtQ=";
                    };

                    buildInputs = with pkgs.python3Packages; [
                      pip
                      pytest
                    ];

                    propagatedBuildInputs = [
                      pkgs.sphinx
                      pkgs.python3Packages.parsimonious
                    ];
                  }
                )
              ])
            )

            pkgs.nodejs
            pkgs.nodePackages.live-server
            pkgs.nodePackages.jsdoc

            pkgs.chromedriver
          ];

          # modifies the environment; bash
          shellHook = ''
            export PYTHONPATH=$(pwd)/util/genfig:$PYTHONPATH
            export PATH=$(pwd)/util/genfig/bin:$(pwd)/util/scripts:$PATH
          '';
        }
    );
  };
}
