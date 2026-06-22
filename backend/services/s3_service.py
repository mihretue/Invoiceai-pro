import boto3
from config import AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET
from datetime import datetime
import uuid

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name='us-east-1'
)


def upload_file(file_content: bytes, filename: str, content_type: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    s3_key = f"invoices/{timestamp}_{unique_id}_{filename}"

    s3_client.put_object(
        Bucket=AWS_BUCKET,
        Key=s3_key,
        Body=file_content,
        ContentType=content_type,
        ServerSideEncryption='AES256'
    )
    print(f"File uploaded to S3: {s3_key}")
    return s3_key

def delete_file(s3_key: str) -> bool:
    try:
        s3_client.delete_object(Bucket=AWS_BUCKET, Key=s3_key)
        print(f"File deleted from S3: {s3_key}")
        return True
    except Exception as e:
        print(f"S3 delete error: {str(e)}")
        return False

def get_signed_url(s3_key: str, expires_in: int = 3600) -> str:
    try:
        return s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': AWS_BUCKET, 'Key': s3_key},
            ExpiresIn=expires_in
        )
    except Exception as e:
        print(f"URL generation error: {str(e)}")
        return ""

def file_exists(s3_key: str) -> bool:
    try:
        s3_client.head_object(Bucket=AWS_BUCKET, Key=s3_key)
        return True
    except Exception:
        return False
