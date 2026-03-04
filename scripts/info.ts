import { Database } from "./database";

export async function BotQuery(req: Bun.BunRequest) {
    try {
        const url = new URL(req.url);
        const search = url.searchParams.get("search") || "";
        const page = parseInt(url.searchParams.get("page") || "1");
        const pageSize = 20;
        const skip = (page - 1) * pageSize;

        let query: any = {
            isPublic: true // only public bots
        };

        if (search.trim() !== "") {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.name = {
                $regex: escaped,
                $options: "i", // case insensitive
            };
        }

        const collection = Database.collection("bots");
        const total = await collection.countDocuments(query);

        const results = await collection
            .find(query, {
                projection: { _id: 1, bio: 1, img: 1, name: 1 } // only return these fields
            })
            .skip(skip)
            .limit(pageSize)
            .toArray();

        return new Response(JSON.stringify({
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            totalItems: total,
            data: results
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
}

export async function BotInfo(req: Bun.BunRequest) {
    try {
        const url = new URL(req.url);
        const botId = url.searchParams.get("id");

        if (!botId) { return new Response(JSON.stringify({ error: "Bot ID is required" }), { status: 400 }) };

        const collection = Database.collection("bots");

        const bot = await collection.findOne(
            { _id: botId, isPublic: true } as any,
            { projection: { _id: 1, bio: 1, img: 1, name: 1 } }
        );

        if (!bot) { return new Response(JSON.stringify({ error: "Bot not found or not public" }), { status: 404 }) };

        return new Response(JSON.stringify(bot), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
}