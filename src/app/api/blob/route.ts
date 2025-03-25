import { NextResponse } from "next/server";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

export async function GET() {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
    const blobName = "test.txt"; // Change this if needed

    if (!accountName || !accountKey || !containerName) {
      return NextResponse.json({ error: "Missing Azure Storage environment variables" }, { status: 500 });
    }

    // Authenticate with the storage account key
    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );

    // Get the container and blob client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Check if the blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      return NextResponse.json({ error: "Blob not found" }, { status: 404 });
    }

    // Download the blob content
    const downloadResponse = await blobClient.download();
    const text = await streamToString(downloadResponse.readableStreamBody!);

    return NextResponse.json({ name: blobName, content: text }, { status: 200 });

  } catch (error) {
    console.error("Azure Blob Storage Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch blob from Azure Blob Storage" }, { status: 500 });
  }
}

// Convert stream to string
async function streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    readableStream.on("data", (chunk) => chunks.push(chunk));
    readableStream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    readableStream.on("error", reject);
  });
}
