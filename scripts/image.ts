import { env } from 'bun';
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";


import sharp from 'sharp';

if (!env.DB_NAME) {
    throw new Error("No DB_NAME found!");
} else if (!env.R2_ACCESS_KEY) {
    throw new Error("No R2_ACCESS_KEY found!");
} else if (!env.R2_SECRET_ACCESS_KEY) {
    throw new Error("No R2_SECRET_ACCESS_KEY found!");
} else if (!env.R2_ENDPOINT) {
    throw new Error("No R2_ENDPOINT found!");
} else if (!env.R2_BASE_PATH) {
    throw new Error("No R2_BASE_PATH found!");
}

const MulterStorage = multer.memoryStorage()
const MulterUpload = multer({
    storage: MulterStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (_: any, file: any, cb: any) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/gif") {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG/PNG images are allowed"));
        }
    },
});

const S3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function CreateImage(base64Image: string) {
    try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const webpBuffer = await sharp(imageBuffer)
            .webp({ quality: 20 })
            .toBuffer();

        return {
            success: true,
            buffer: webpBuffer,
        };
    } catch (error) {
        console.error("Conversion failed:", error);

        return {
            success: false,
            buffer: null,
        };
    }
}

export async function UploadImage(buffer: Buffer, key: string) {
    try {
        await S3.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME, // just the bucket name
                Key: key,
                Body: buffer,
                ContentType: "image/webp",
            })
        );
        return `${process.env.R2_BASE_PATH}${key}`;
    } catch (err) {
        console.error("Upload failed:", err);
        throw err;
    }
}