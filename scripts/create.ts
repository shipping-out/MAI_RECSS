import { Database } from "./database";
import * as image from "./image";
import * as session from "./session";

const IncompleteDataResponse = new Response(JSON.stringify({ response: "Incomplete data" }),
    { status: 403, headers: { "Content-Type": "application/json" } }
);

const standardTags = [
    "Male", "Female", "Dominant", "Submissive", "Smut", "Game", "Anime", "Non-Human",
    "Switch", "Fluff", "Multiple", "Scenario", "Magical", "MLM", "WLW", "MalePOV",
    "FemPOV", "AnyPOV", "Angst", "Furry", "Non-Binary", "RPG", "Horror", "Pokémon",
    "Trans", "Sci-Fi", "Robot", "Comedy"
];

export async function CreateBot(req: Bun.BunRequest) {
    try {
        const uploadingUser = await session.GetUserFromSession(req);
        if (!uploadingUser) { return IncompleteDataResponse };

        // Data
        const {
            avatar,

            botName,
            botChatName,
            botBio,

            botPersonality,
            botExampleMessages,
            botStartingMessage,

            isPublic,
            isDefinitionPublic,

            tags,
        } = await req.json();

        // Make sure fields are filled in
        if (
            !avatar

            || botName.trim().length < 1
            || botPersonality.trim().length < 1
            || botStartingMessage.trim().length < 1
        ) { return IncompleteDataResponse };

        const result = await image.CreateImage(avatar);
        const buffer = result.buffer;
        if (!buffer) { return IncompleteDataResponse };

        const uploadedImage = await image.UploadImage(buffer, `${uploadingUser.username}_bot_${crypto.randomUUID()}`);

        console.log("User tags:", tags);

        const addedTags: string[] = [];

        tags?.split(",").forEach((tag: string) => {
            const clean = tag.trim().toLowerCase();

            if (!standardTags.map(t => t.toLowerCase()).includes(clean)) {
                console.log("Adding", clean, "to tags as user tag");

                addedTags.push(`#${clean}`);
            } else {
                addedTags.push(clean);
                console.log("Adding", clean, "to tags");

            }
        });

        const builtBot = {
            img: uploadedImage,

            name: botName,
            chatName: botChatName,
            bio: botBio,

            personality: botPersonality,
            exampleMessages: botExampleMessages,
            startingMessages: botStartingMessage,

            isPublic,
            isDefinitionPublic,

            tags: addedTags,

            owner: uploadingUser._id,
            createdAt: new Date(),

            messages: 0,
        }

        const insertResult = await Database.collection("bots").insertOne(builtBot)

        if (!insertResult.insertedId) { console.error("Error inserting new bot!"); return };

        // Add to users thing
        await Database.collection("users").updateOne(
            { _id: uploadingUser._id },
            { $addToSet: { bots: insertResult.insertedId } as any }
        );

        console.log("Made new bot with id", insertResult.insertedId);

        return new Response(JSON.stringify({ id: insertResult.insertedId }), { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
}