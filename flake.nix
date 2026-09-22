{
  description = "bitcoin-cycles development environment";

  inputs = {
    # Unstable: pnpm_11 and current Node land here first.
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_24
              # Pinned to the 11.x series. The bare `pnpm` attribute resolves to
              # pnpm_12 (the Rust rewrite), so an unversioned reference here would
              # silently jump majors on `nix flake update`.
              pkgs.pnpm_11
            ];

            # packageManager in package.json must match this pnpm, or pnpm
            # downloads its own copy over the network on every command.
            shellHook = ''
              echo "bitcoin-cycles: node $(node --version), pnpm $(pnpm --version)"
            '';
          };
        }
      );
    };
}
