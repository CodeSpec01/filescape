import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, dynamoDbClient } from "../../../lib/aws";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const TABLE_NAME = process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME!;
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!;

export default async function SharePage(props: { params: Promise<{ fileId: string }> }) {
  const params = await props.params;
  const fileId = params.fileId;

  let file = null;
  let errorMsg = null;
  let downloadUrl = null;

  try {
    // 1. Fetch file from DynamoDB
    const dbCommand = new GetCommand({ TableName: TABLE_NAME, Key: { fileId } });
    const response = await dynamoDbClient.send(dbCommand);
    file = response.Item;

    if (!file) {
      errorMsg = "This file does not exist or has been deleted.";
    } else {
      const shareSettings = file.shareSettings || { type: "private" };

      // 2. Evaluate Permissions
      if (shareSettings.type === "private") {
        errorMsg = "This file is marked as private by the owner.";
      } 
      else if (shareSettings.type === "public" && shareSettings.expiresAt && new Date() > new Date(shareSettings.expiresAt)) {
        errorMsg = "This share link has expired.";
      } 
      else if (shareSettings.type === "restricted") {
        const user = await currentUser();
        if (!user) {
          // Send them to Clerk to log in, then return here
          redirect(`/sign-in?redirect_url=/share/${fileId}`);
        }
        const userEmail = user.emailAddresses[0]?.emailAddress;
        if (!shareSettings.allowedEmails?.includes(userEmail)) {
          errorMsg = `Your email (${userEmail}) does not have permission to view this file.`;
        }
      }

      // 3. If no errors, generate the S3 Link!
      if (!errorMsg) {
        const s3Command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.s3Key,
          ResponseContentDisposition: `attachment; filename="${file.fileName}"`,
        });
        downloadUrl = await getSignedUrl(s3Client, s3Command, { expiresIn: 3600 });
      }
    }
  } catch (error) {
    console.error("Share page error:", error);
    errorMsg = "An internal server error occurred.";
  }

  // Helper to pick an icon
  const getIcon = (type: string = "") => {
    if (type.includes('pdf')) return 'description';
    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'movie';
    if (type.includes('json') || type.includes('code')) return 'code';
    return 'draft';
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center font-body p-4 relative overflow-hidden text-on-surface">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-2xl p-8 shadow-2xl text-center relative z-10">
        
        {/* LOGO */}
        <div className="flex items-center justify-center gap-2 mb-8 opacity-80">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black">
            <span className="material-symbols-outlined text-[20px]">cloud</span>
          </div>
          <span className="text-xl font-headline font-black tracking-tight text-secondary">Filescape</span>
        </div>

        {errorMsg ? (
          // ERROR STATE UI
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h1 className="text-xl font-bold text-secondary mb-2">Access Denied</h1>
            <p className="text-sm text-on-surface-variant mb-6">{errorMsg}</p>
          </div>
        ) : (
          // SUCCESS / DOWNLOAD STATE UI
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <span className="material-symbols-outlined text-4xl">{getIcon(file?.fileType)}</span>
            </div>
            
            <h1 className="text-lg font-bold text-secondary mb-1 truncate px-4" title={file?.fileName}>
              {file?.fileName}
            </h1>
            
            <p className="text-xs text-on-surface-variant mb-8">
              Shared via Filescape Secure Vault
            </p>

            {downloadUrl && (
              <a 
                href={downloadUrl}
                className="w-full py-3 bg-primary text-black rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}