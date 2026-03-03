import { spawn } from "child_process";

spawn(
    "cmd.exe",
    ["/c", "start", "C:\\cloudflared\\cloudflared.exe", "tunnel", "run", "imre-tunnel"],
    {
        detached: true,
        stdio: "ignore",
        shell: true,
    }
);
