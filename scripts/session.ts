// Middleware to force login for each page
export function ServePage(req: Bun.BunRequest, page: string) {
    // Make sure to wrap it in a safe statement
    try {
        // Check for a valid login
        const cookieHeader = req.headers.get("cookie");
        const sessionExists: boolean | undefined = cookieHeader?.includes("session=");

        // No, send login
        if (!sessionExists) {
            return new Response(Bun.file("./public/login.html"), {
                headers: { "Content-Type": "text/html" },
            })
        }

        // Success, send page
        return new Response(Bun.file(page), {
            headers: { "Content-Type": "text/html" },
        })
    } catch (err) {
        console.log(`Error when serving page: ${err}`)
    }
}

export async function AttemptLogin(req: Bun.BunRequest) {
    try {
        const body = await req.json();
    } catch (err) {
        console.log(`Error in login: ${err}`)
    }
}