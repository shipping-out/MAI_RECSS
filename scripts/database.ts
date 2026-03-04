import { env } from 'bun';
import dns from "dns";

import { Db, MongoClient, ObjectId } from 'mongodb';

dns.setServers(["1.1.1.1"]); // Cloudflare public DNS

let client: MongoClient;
export let Database: Db;

// Connect to MongoDB before exporting Database
export async function connectDatabase() {
    if (!env.MONGO_URI) {
        throw new Error("No MONGO_URI found!");
    }

    client = new MongoClient(env.MONGO_URI);
    try {
        await client.connect();
        Database = client.db(env.DB_NAME);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}


export async function GetBotInfo(_id: string) {

}