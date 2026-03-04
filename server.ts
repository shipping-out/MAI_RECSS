import * as db from "./scripts/database";
import * as session from "./scripts/session";
import * as info from "./scripts/info";
import * as create from "./scripts/create";

await db.connectDatabase();

const server = Bun.serve({
    port: 3000,

    routes: {
        // Pages
        "/": (req) => session.ServePage(req, "./public/home.html"),
        "/create": (req) => session.ServePage(req, "./public/create.html"),

        // User login
        "/login": (req) => session.AttemptLogin(req),


        // Bot stuff
        "/botlist": async (req) => {
            if (!session.IsLoggedIn(req)) {
                return new Response(JSON.stringify({ response: "Not logged in" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            return info.BotQuery(req);
        },
        "/botinfo": async (req) => {
            if (!session.IsLoggedIn(req)) {
                return new Response(JSON.stringify({ response: "Not logged in" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            return info.BotInfo(req)
        },

        "/api/createBot": async (req) => {
            if (!session.IsLoggedIn(req)) {
                return new Response(JSON.stringify({ response: "Not logged in" }),
                    { status: 403, headers: { "Content-Type": "application/json" } }
                );
            }

            return create.CreateBot(req);
        }
    },

    // Fetch static content
    async fetch(req: any, server) {
        const url = new URL(req.url);

        // helper for MIME types
        function getContentType(path: string) {
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".js")) return "application/javascript";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".svg")) return "image/svg+xml";
            return "application/octet-stream";
        }

        // Serve static files from /public
        if (url.pathname.startsWith("/styles") ||
            url.pathname.startsWith("/scripts") ||
            url.pathname.startsWith("/icons")) {

            const file = Bun.file(`./public${url.pathname}`);
            return new Response(file, {
                headers: {
                    "Content-Type": getContentType(url.pathname),
                    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            });
        }

        return new Response("Not Found", { status: 404 });
    },

    websocket: {
        data: {} as { chatId: string },

        open(ws) {
            ws.subscribe(ws.data.chatId);
        },

        message(ws, message) { return },

        close(ws) {
            ws.unsubscribe(ws.data.chatId);
        },
    },
});

console.log("Server running at http://localhost:3000");