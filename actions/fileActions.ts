"use server";

import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { s3Client, dynamoDbClient } from "../lib/aws"; // Adjust the path if your lib folder is elsewhere
import crypto from "crypto";

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!;
const TABLE_NAME = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME!;

export async function getPresignedUploadUrl(fileName: string, fileType: string, fileSize: number) {
  // 1. Verify the user is authenticated via Clerk
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: You must be logged in to upload files.");
  }

  // 2. Generate a unique ID for the file and construct the S3 Path
  // We put the file inside a "folder" named after the user's ID for security
  const fileId = crypto.randomUUID();
  const s3Key = `${userId}/${fileId}-${fileName}`;

  try {
    // 3. Ask S3 for a temporary, secure upload URL
    const s3Command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
    });
    
    // This URL will expire in 60 seconds
    const uploadUrl = await getSignedUrl(s3Client, s3Command, { expiresIn: 60 });

    // 4. Record the file's metadata in DynamoDB
    const dbCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        fileId: fileId,
        userId: userId,
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        s3Key: s3Key,
        isStarred: false,
        createdAt: new Date().toISOString(), // This acts as our Sort Key!
      },
    });

    await dynamoDbClient.send(dbCommand);

    // 5. Hand the URL back to the frontend so it can upload the physical file
    return { success: true, uploadUrl, fileId };

  } catch (error) {
    console.error("Error generating upload pipeline:", error);
    return { success: false, error: "Failed to initialize upload." };
  }
}

// Make sure you have this variable at the top of your file with the others:
const GSI_NAME = process.env.NEXT_PUBLIC_DYNAMODB_GSI_NAME!;

export async function getUserFiles() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Query DynamoDB using the GSI to get files for this specific user
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      // ScanIndexForward: false sorts the 'createdAt' Sort Key in descending order (newest first)
      ScanIndexForward: false, 
    });

    const response = await dynamoDbClient.send(command);
    
    return { success: true, files: response.Items };
  } catch (error) {
    console.error("Error fetching files:", error);
    return { success: false, error: "Failed to fetch files." };
  }
}


export async function getDownloadUrl(s3Key: string, originalFileName: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Ensure the user is only downloading their own files
    if (!s3Key.startsWith(`${userId}/`)) {
      throw new Error("Forbidden: You do not own this file.");
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      // This forces the browser to trigger a "Save As" download instead of just opening it
      ResponseContentDisposition: `attachment; filename="${originalFileName}"`,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return { success: true, downloadUrl };
  } catch (error) {
    console.error("Download generation failed:", error);
    return { success: false, error: "Failed to generate download link." };
  }
}

export async function deleteFile(fileId: string, s3Key: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (!s3Key.startsWith(`${userId}/`)) {
      throw new Error("Forbidden");
    }

    // 1. Delete the physical file from S3
    const s3Command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });
    await s3Client.send(s3Command);

    // 2. Delete the metadata record from DynamoDB
    const dbCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        fileId: fileId, // Partition key required to delete
      },
    });
    await dynamoDbClient.send(dbCommand);

    return { success: true };
  } catch (error) {
    console.error("Delete failed:", error);
    return { success: false, error: "Failed to delete file." };
  }
}

export async function toggleStarFile(fileId: string, currentStatus: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // We only need the fileId to update the specific row
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { fileId: fileId },
      UpdateExpression: "SET isStarred = :newStatus",
      ExpressionAttributeValues: {
        ":newStatus": !currentStatus,
      },
    });

    await dynamoDbClient.send(command);
    return { success: true };
  } catch (error) {
    console.error("Star toggle failed:", error);
    return { success: false, error: "Failed to update star status." };
  }
}