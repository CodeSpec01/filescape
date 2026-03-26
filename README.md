# Filescape ☁️

A secure, full-stack, cloud-native file storage and sharing platform. 

Filescape is designed to mimic enterprise SaaS architecture, utilizing Next.js Server Actions, highly restricted AWS S3 Presigned URLs for direct-to-cloud uploads, and an adjacency-list pattern in DynamoDB for infinite virtual folder nesting.

## 🚀 Features

* **Direct-to-Cloud Uploads:** Bypasses server bandwidth bottlenecks using short-lived S3 Presigned URLs for infinite scalability.
* **Virtual Folder System:** Modeled using an Adjacency List pattern in NoSQL (DynamoDB) to allow infinite nesting without performance degradation.
* **Secure File Sharing (The Bouncer Pattern):** Generate time-expiring or email-restricted share links. Authorization is handled server-side before resolving the S3 asset.
* **Dynamic Storage Analytics:** Real-time calculation of vault capacity and file-type breakdowns.
* **Optimistic UI Updates:** Instantaneous drag-and-drop, starring, and deletion operations for a premium UX.

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
* **Backend:** Next.js Server Actions
* **Database:** AWS DynamoDB (NoSQL with Global Secondary Indexes)
* **Storage:** AWS S3
* **Authentication:** Clerk
* **Cloud SDK:** AWS SDK for JavaScript (v3)

## 🏗️ Architecture



Instead of passing heavy file buffers through the Next.js API, the system uses a highly decoupled architecture:
1. The client requests an upload ticket from the Next.js Server Action.
2. The Server Action authenticates the user via Clerk and requests a 60-second Presigned URL from AWS S3.
3. The Server Action logs the initial file metadata into DynamoDB.
4. The client uses the Presigned URL to `PUT` the file directly into the S3 Bucket.

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/codespec01/filescape.git
   cd filescape
    ```
2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add the following keys:

    ```bash
    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

    # AWS Credentials
    AWS_REGION=
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=

    # AWS Infrastructure
    NEXT_PUBLIC_AWS_S3_BUCKET_NAME=
    NEXT_PUBLIC_DYNAMODB_TABLE_NAME=
    NEXT_PUBLIC_DYNAMODB_GSI_NAME=
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application.

-----

## 🌍 Deployment Roadmap (Production Checklist)

This application is currently optimized for local development. To deploy this to a production environment (e.g., Vercel), the following architectural and security updates must be applied:

### 1\. Update AWS CORS Policies

The S3 bucket currently allows `PUT` requests from `localhost:3000`. This must be updated to the production domain.

  * Go to AWS S3 -\> Bucket -\> Permissions -\> CORS.
  * Change `"AllowedOrigins": ["http://localhost:3000"]` to `"AllowedOrigins": ["https://filescape.yourdomain.com"]`.

### 2\. IAM Policy Lockdown (Principle of Least Privilege)

The current IAM User has `AmazonS3FullAccess` and `AmazonDynamoDBFullAccess`. For production, replace these with a custom inline JSON policy restricting access to *only* the `filescape-vault-v1` bucket and the `Filescape_Files` table.

### 3\. Vercel Environment Configuration

  * Push the codebase to a GitHub repository.
  * Import the repository into Vercel.
  * Before clicking "Deploy", copy all variables from `.env.local` into the Vercel Environment Variables settings.
  * *Note: Do not commit the `.env.local` file to version control.*

### 4\. Clerk Production Instance

  * Switch Clerk from "Development" to "Production" in the Clerk Dashboard.
  * Update the DNS records of your domain to verify ownership with Clerk.
  * Swap the development Clerk keys in Vercel with the new Production keys.

<!-- end list -->
