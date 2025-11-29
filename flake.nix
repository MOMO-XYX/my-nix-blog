{
  description = "My Next.js 15 Blog Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux"; # 如果你是 ARM 架构 (如 Mac M1/M2) 请改为 aarch64-linux
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_22    # 最新的 LTS
          pnpm         # 推荐的包管理器
          postgresql   # 主要为了用 psql 命令行工具
          redis        # 主要为了用 redis-cli
          git
        ];

        shellHook = ''
          echo "? Welcome to your Next.js 15 + Nix environment!"
          echo "Node version: $(node -v)"
          echo "Pnpm version: $(pnpm -v)"
        '';
      };
    };
}