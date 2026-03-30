import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer for Cloudinary SDK
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise<Response>((resolve) => {
      cloudinary.uploader.upload_stream(
        { folder: "wedding-builder" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload failed:", error);
            resolve(NextResponse.json({ error: "Cloudinary upload failed", details: error }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ secure_url: result?.secure_url }, { status: 200 }));
          }
        }
      ).end(buffer);
    });

  } catch (error) {
    console.error("API Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract public_id from a typical cloudinary URL:
    // .../upload/v1746234/folder/filename.jpg -> folder/filename
    const uploadSplit = url.split("/upload/");
    if (uploadSplit.length < 2) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    let publicIdWithExtension = uploadSplit[1];
    
    // Remove the version tag (e.g. v1740023423/)
    publicIdWithExtension = publicIdWithExtension.replace(/^v\d+\//, "");
    
    // Remove the file extension (e.g. .jpg, .png)
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

    if (!publicId) {
       return NextResponse.json({ error: "Could not parse public ID" }, { status: 400 });
    }

    return new Promise<Response>((resolve) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Cloudinary destroy failed:", error);
          resolve(NextResponse.json({ error: "Cloudinary delete failed", details: error }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true, result }, { status: 200 }));
        }
      });
    });

  } catch (error) {
    console.error("API Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
