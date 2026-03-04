import { Database } from "./database";
import bcrypt from "bcrypt";

// Passwords //
async function HashPassword(plainPassword: string): Promise<string> {
    const saltRounds = 10; // Higher = more secure but slower
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
}

async function VerifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
    return await bcrypt.compare(inputPassword, storedHash);
}

// //


export async function IsLoggedIn(req: Bun.BunRequest): Promise<boolean> {
    // Make sure to wrap it in a safe statement
    try {
        // Check for a valid login
        const cookieHeader = req.headers.get("cookie");
        const sessionCookie = cookieHeader?.match(/session=([^;]+)/)?.[1];
        const session = sessionCookie ? await Database.collection("sessions").findOne({ token: sessionCookie }) : null;

        // No, send login. The session needs to be valid and insided the sessions.
        if (!session || session.expiresAt < new Date()) {
            return false;
        };

        // Success, send page
        return true
    } catch (err) {
        console.log(`Error when serving page: ${err}`);
    }

    return false;
}
// Middleware to force login for each page
export async function ServePage(req: Bun.BunRequest, page: string) {
    // Make sure to wrap it in a safe statement
    try {
        console.log("User is logged in?:", await IsLoggedIn(req));

        // No, send login. The session needs to be valid and insided the sessions.
        if (!await IsLoggedIn(req)) {
            return new Response(Bun.file("./public/login.html"), {
                headers: { "Content-Type": "text/html" },
            });
        }

        // Success, send page
        return new Response(Bun.file(page), {
            headers: { "Content-Type": "text/html" },
        });
    } catch (err) {
        console.log(`Error when serving page: ${err}`);
    }
}

// Login function
export async function AttemptLogin(req: Bun.BunRequest) {
    try {
        const formData = await req.json();

        const username = formData.username?.toString() || "";
        const password = formData.password?.toString() || "";

        console.log(`[Username]: ${username}`);

        const user = await Database.collection("users").findOne({ username });
        const valid = user ? await VerifyPassword(password, user.passwordHash) : false;

        if (!valid) {
            return new Response(JSON.stringify({}), {
                status: 401,
                headers: {
                    "Content-Type": "application/json",
                }
            });
        };

        // Create a new session
        const sessionToken = crypto.randomUUID();

        await Database.collection("sessions").insertOne({
            token: sessionToken,
            username,
            expiresAt: new Date(Date.now() + 3600_000),
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
            }
        });
    } catch (err) {
        console.log(`Error with login: ${err}`);

        return new Response(JSON.stringify({}), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            }
        });
    }
}