import { NextRequest, NextResponse } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, dynamoDbClient } from "../../../lib/aws";
import { currentUser } from "@clerk/nextjs/server";

const TABLE_NAME = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME!;
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!;

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
//   const fileId = params.fileId;
// 1. Await the params object (The new Next.js requirement)
  const nparams = await params;
  const fileId = nparams.fileId;
  try {
    // 1. Fetch the file metadata from DynamoDB
    const dbCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { fileId: fileId },
    });
    
    const { Item: file } = await dynamoDbClient.send(dbCommand);

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const shareSettings = file.shareSettings || { type: "private" };

    // 2. Access Control Logic
    if (shareSettings.type === "private") {
      return new NextResponse("This file is private.", { status: 403 });
    }

    if (shareSettings.type === "public") {
      // Check expiration
      if (shareSettings.expiresAt && new Date() > new Date(shareSettings.expiresAt)) {
        return new NextResponse("This share link has expired.", { status: 410 });
      }
    }

    if (shareSettings.type === "restricted") {
      const user = await currentUser();
      if (!user) {
        // If not logged in, redirect to Clerk login, then back to this exact URL
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set('redirect_url', request.url);
        return NextResponse.redirect(loginUrl);
      }
      
      const userEmail = user.emailAddresses[0]?.emailAddress;
      if (!shareSettings.allowedEmails?.includes(userEmail)) {
        return new NextResponse("You do not have permission to view this file.", { status: 403 });
      }
    }

    // 3. Passed the Bouncer! Generate the secure 60-second S3 URL
    const s3Command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.fileName}"`,
    });

    const downloadUrl = await getSignedUrl(s3Client, s3Command, { expiresIn: 60 });

    // 4. Redirect the user's browser directly to the AWS download
    return NextResponse.redirect(downloadUrl);

  } catch (error) {
    console.error("Share routing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}