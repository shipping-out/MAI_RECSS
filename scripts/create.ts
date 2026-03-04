import { Database } from "./database";
import * as image from "./image";
import * as session from "./session";

const IncompleteDataResponse = new Response(JSON.stringify({ response: "Incomplete data" }),
    { status: 403, headers: { "Content-Type": "application/json" } }
);

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
        console.log(uploadedImage);

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