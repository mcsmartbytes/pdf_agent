// TODO: AWS migration complete — all database access is here.
// To switch services later, only this file needs to change.

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import type { DocumentRecord, ExtractedDocument } from '@/types'

const TABLE_NAME = 'documents'

function getClient() {
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.')
  }

  const dynamo = new DynamoDBClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  })

  return DynamoDBDocumentClient.from(dynamo)
}

export async function saveDocument(
  filename: string,
  extracted: ExtractedDocument,
  pageCount: number = 0
): Promise<DocumentRecord> {
  const client = getClient()

  const record: DocumentRecord = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    filename,
    document_type: extracted.document_type,
    page_count: pageCount,
    raw_json: extracted,
    source_path: filename,
  }

  await client.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: record,
  }))

  return record
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const client = getClient()

  const result = await client.send(new ScanCommand({
    TableName: TABLE_NAME,
    // Only fetch metadata — skip raw_json to keep the list fast
    ProjectionExpression: 'id, created_at, filename, document_type, page_count',
  }))

  const items = (result.Items ?? []) as DocumentRecord[]

  // Sort newest first — DynamoDB Scan returns unordered
  return items.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getDocumentById(id: string): Promise<DocumentRecord> {
  const client = getClient()

  const result = await client.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id },
  }))

  if (!result.Item) {
    throw new Error(`Document not found: ${id}`)
  }

  return result.Item as DocumentRecord
}
