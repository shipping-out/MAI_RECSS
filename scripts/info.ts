import { Database } from "./database";

const public_projection = { _id: 1, bio: 1, img: 1, name: 1, messages: 1, tags: 1 };

export async function BotQuery(req: Bun.BunRequest) {
    try {
        const url = new URL(req.url);
        let search = url.searchParams.get("search") || "";
        let tagsParam = url.searchParams.get("tags") || "";

        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
        const pageSize = 20;
        const skip = (page - 1) * pageSize;

        // Base query: starts with just the public filter
        const query: any = { isPublic: true };

        // Only add search if it's not empty
        if (search != "null" && search.trim().length > 0) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.name = {
                $regex: escaped,
                $options: "i",
            };
        }

        // Add tags
        if (tagsParam != "null" && tagsParam.trim().length > 0) {
            const tagsArray = tagsParam
                .split(",")
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            if (tagsArray.length > 0) {
                query.tags = { $all: tagsArray };
            }
        }

        const collection = Database.collection("bots");

        const [total, results] = await Promise.all([
            collection.countDocuments(query),
            collection.find(query)
                .project(public_projection)
                .skip(skip)
                .limit(pageSize)
                .toArray()
        ]);

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
        console.error("Query Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
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
            { projection: public_projection }
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