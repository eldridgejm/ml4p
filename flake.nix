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
              ])
            )

            pkgs.chromedriver
          ];

          # modifies the environment; bash
          shellHook = ''
            export PYTHONPATH=$(pwd)/util/genfig:$PYTHONPATH
            export PATH=$(pwd)/util/genfig/bin:$PATH
          '';
        }
    );
  };
}
