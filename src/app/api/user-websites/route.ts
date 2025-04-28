import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const dir = path.join(process.cwd(), 'gen_comp')
  let folders: { name: string; html: string[]; images: string[] }[] = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    folders = entries
      .filter((entry) => entry.isDirectory())
      .map((folder) => {
        const folderPath = path.join(dir, folder.name)
        const files = fs.readdirSync(folderPath)
        return {
          name: folder.name,
          html: files.filter((f) => f.endsWith('.html')),
          images: files.filter((f) => /\.(png|jpe?g|gif|svg)$/i.test(f)),
        }
      })
  } catch (e) {
    console.error('Error reading directories:', e);
  }
  return NextResponse.json({ folders })
}