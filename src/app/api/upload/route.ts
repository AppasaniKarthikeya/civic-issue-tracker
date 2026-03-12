import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename') || 'upload';

  try {
    let fileBuffer: Buffer;
    
    // Check if it's a FormData request (how standard file inputs send data)
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file found in request' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // Otherwise fallback to raw body (used by our custom fetch calls in storageService)
      const arrayBuffer = await request.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: 'Empty file buffer' }, { status: 400 });
    }

    // Wrap Cloudinary upload in a promise using the upload_stream method
    const uploadResult = await new Promise((resolve, reject) => {
      // Create a clean public_id by removing the extension from the filename
      const publicId = filename.replace(/\.[^/.]+$/, "");
      
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'civic-issues', 
          public_id: publicId,
          resource_type: 'auto' // Automatically detect if it's an image or voice (video/audio in Cloudinary)
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Stream the buffer to Cloudinary
      uploadStream.end(fileBuffer);
    });

    // Cast the result to any to safely access secure_url
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const secureUrl = (uploadResult as any).secure_url;

    // Return the URL exactly how the frontend expects it (newBlob.url)
    return NextResponse.json({ url: secureUrl });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload file to Cloudinary' },
      { status: 500 }
    );
  }
}
