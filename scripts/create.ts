export async function CreateBot(req: Bun.BunRequest) {
    try {
        const formData = await req.json();
        console.log("Bot creation data:", formData);

        return new Response(JSON.stringify({}), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
}