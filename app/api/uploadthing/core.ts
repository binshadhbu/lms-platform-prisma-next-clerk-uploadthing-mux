import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
    const { userId } = await auth();
    const isAuthorized = isTeacher(userId);


    if (!userId || !isAuthorized) throw new Error("Unauthorized");
    return { userId };
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    courseImage: f({ image: { maxFileSize: "16MB", maxFileCount: 1 } }).middleware(() =>
        handleAuth()).onUploadComplete(() => { }),
    courseAttachement: f(["text", "image", "video", "audio", "pdf"]).middleware(() => handleAuth()).onUploadComplete(() => { }),
    chapterVideo: f({ video: { maxFileSize: "1GB", maxFileCount: 1 } }).middleware(() =>
        handleAuth()).onUploadComplete(() => { }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
