import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required' },
      { status: 400 }
    );
  }

  try {
    let fileToUpload: File | Blob | null = null;
    
    // Check if it's a FormData request (how standard file inputs send data)
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      fileToUpload = formData.get('file') as File;
    } else {
      // Otherwise fallback to raw body (used by our custom fetch calls in storageService)
      const buffer = await request.arrayBuffer();
      fileToUpload = new Blob([buffer]);
    }

    if (!fileToUpload) {
      return NextResponse.json({ error: 'No file found in request' }, { status: 400 });
    }

    const blob = await put(filename, fileToUpload, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to Vercel Blob' },
      { status: 500 }
    );
  }
}
