import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils
from config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
from datetime import datetime
import uuid

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_file(file_content: bytes, filename: str, content_type: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    base_name = filename.rsplit(".", 1)[0] if "." in filename else filename
    public_id = f"invoices/{timestamp}_{unique_id}_{base_name}"

    result = cloudinary.uploader.upload(
        file_content,
        public_id=public_id,
        resource_type="auto",
    )
    print(f"File uploaded to Cloudinary: {result['public_id']}")
    return result["public_id"]


def delete_file(public_id: str) -> bool:
    try:
        cloudinary.uploader.destroy(public_id, resource_type="auto", invalidate=True)
        print(f"File deleted from Cloudinary: {public_id}")
        return True
    except Exception as e:
        print(f"Cloudinary delete error: {str(e)}")
        return False


def get_signed_url(public_id: str, expires_in: int = 3600) -> str:
    try:
        url, _ = cloudinary.utils.cloudinary_url(public_id, resource_type="auto")
        return url
    except Exception as e:
        print(f"URL generation error: {str(e)}")
        return ""


def file_exists(public_id: str) -> bool:
    try:
        cloudinary.api.resource(public_id, resource_type="auto")
        return True
    except Exception:
        return False
