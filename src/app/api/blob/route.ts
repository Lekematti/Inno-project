import { NextResponse } from 'next/server'
import {BlobServiceClient, StorageSharedKeyCredential} from '@azure/storage-blob'

const azureAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
const azureAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY
const azureContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME

function getCredentials(
  azureAccountKey: string,
  azureAccountName: string,
  azureContainerName: string,
  blobName?: string
) {
  let error
  if (!azureAccountName || !azureAccountKey || !azureContainerName) {
    error = NextResponse.json(
      { error: 'Missing Azure Storage environment variables' },
      { status: 500 }
    )
  }
  // Authenticate with the storage account key
  const credential = new StorageSharedKeyCredential(
    azureAccountName,
    azureAccountKey
  )
  const blobServiceClient = new BlobServiceClient(
    `https://${azureAccountName}.blob.core.windows.net`,
    credential
  )

  // Get the container and blob client
  const containerClient =
    blobServiceClient.getContainerClient(azureContainerName)

  return { containerClient, error }
}

export async function GET() {
  try {
    const blobName = 'test.txt'
    if (!azureAccountKey || !azureAccountName || !azureContainerName) {
      return NextResponse.json(
        { error: 'Missing Azure Storage environment variables' },
        { status: 500 }
      )
    }
    const { containerClient, error } = getCredentials(
      azureAccountKey,
      azureAccountName,
      azureContainerName
    )

    const blobClient = containerClient.getBlobClient(blobName)

    // Check if the blob exists
    const exists = await blobClient.exists()
    if (!exists) {
      return NextResponse.json({ error: 'Blob not found' }, { status: 404 })
    }

    // Download the blob content
    const downloadResponse = await blobClient.download()
    const text = await streamToString(downloadResponse.readableStreamBody!)

    return NextResponse.json({ name: blobName, content: text }, { status: 200 })
  } catch (error) {
    console.error('Azure Blob Storage Fetch Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blob from Azure Blob Storage' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    if (!azureAccountKey || !azureAccountName || !azureContainerName) {
      return NextResponse.json(
        { error: 'Missing Azure Storage environment variables' },
        { status: 500 }
      )
    }
    const { containerClient, error } = getCredentials(
      azureAccountKey,
      azureAccountName,
      azureContainerName
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name
    const blobClient = containerClient.getBlockBlobClient(fileName)

    await blobClient.uploadData(fileBuffer)
    return NextResponse.json({ message: '✅ File uploaded successfully!' })
  } catch (error) {
    console.error('Azure Blob Storage Post Error:', error)
    return NextResponse.json(
      { error: 'Failed to post blob to Azure Blob Storage' },
      { status: 500 }
    )
  }
}

// Convert stream to string
async function streamToString(
  readableStream: NodeJS.ReadableStream
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    readableStream.on('data', (chunk) => chunks.push(chunk))
    readableStream.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf-8'))
    )
    readableStream.on('error', reject)
  })
}
