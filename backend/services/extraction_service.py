import json
import base64
import mimetypes
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from config import OPENAI_API_KEY

# ===== DATA MODEL =====

class InvoiceData(BaseModel):
    vendor_name: str = Field(description="Company/vendor name")
    invoice_number: str = Field(description="Invoice number")
    invoice_date: str = Field(description="Invoice date in YYYY-MM-DD format")
    amount: float = Field(description="Total amount (numeric)")
    currency: str = Field(default="USD", description="Currency code")
    items: list[str] = Field(default_factory=list, description="Line items purchased")
    description: str = Field(default="", description="General description")

# ===== LLM =====

llm = ChatOpenAI(
    model="gpt-4-vision-preview",
    api_key=OPENAI_API_KEY,
    temperature=0,
    max_tokens=500,
)

# ===== PROMPTS =====

EXTRACTION_PROMPT = """You are an expert invoice processor. Extract the following information from this invoice image:

1. Vendor/Company name
2. Invoice number
3. Invoice date (format as YYYY-MM-DD)
4. Total amount (numeric value only, no $ or commas)
5. Currency (USD, EUR, GBP, etc.)
6. Items - list of what was purchased
7. Description - general description of the invoice

Return ONLY valid JSON in this exact format, no markdown, no code blocks:
{
    "vendor_name": "string",
    "invoice_number": "string",
    "invoice_date": "YYYY-MM-DD",
    "amount": 0.0,
    "currency": "USD",
    "items": ["item1", "item2"],
    "description": "string"
}"""

CATEGORIZATION_PROMPT = """Categorize this business expense into exactly ONE of these categories:
['Meals', 'Supplies', 'Software', 'Travel', 'Equipment', 'Other']

Vendor: {vendor}
Amount: ${amount}
Description: {description}

Return ONLY the category name, nothing else."""

# ===== FUNCTIONS =====

async def extract_invoice_from_image(image_path: str) -> dict:
    with open(image_path, "rb") as f:
        image_data = f.read()

    image_base64 = base64.b64encode(image_data).decode("utf-8")
    mime_type = mimetypes.guess_type(image_path)[0] or "image/png"
    print(f"Image type: {mime_type}, size: {len(image_data) / 1024:.1f}KB")

    message = HumanMessage(
        content=[
            {"type": "text", "text": EXTRACTION_PROMPT},
            {
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{image_base64}"},
            },
        ]
    )

    print("Calling GPT-4 Vision API...")
    response = llm.invoke([message])
    response_text = response.content

    json_start = response_text.find("{")
    json_end = response_text.rfind("}") + 1
    if json_start == -1 or json_end == 0:
        raise ValueError(f"No JSON in response: {response_text[:200]}")

    extracted = json.loads(response_text[json_start:json_end])

    for field in ["vendor_name", "invoice_number", "invoice_date", "amount", "currency"]:
        if field not in extracted:
            extracted[field] = "" if field != "amount" else 0.0

    print(f"Extraction complete — vendor: {extracted['vendor_name']}, amount: {extracted['amount']}")
    return extracted


async def categorize_expense(vendor: str, amount: float, description: str) -> str:
    prompt = CATEGORIZATION_PROMPT.format(vendor=vendor, amount=amount, description=description)
    response = llm.invoke([HumanMessage(content=prompt)])
    category = response.content.strip()

    valid = {"Meals", "Supplies", "Software", "Travel", "Equipment", "Other"}
    if category not in valid:
        print(f"Unknown category '{category}', defaulting to Other")
        category = "Other"

    print(f"Categorized as: {category}")
    return category


async def process_invoice(image_path: str) -> dict:
    print(f"Processing invoice: {image_path}")
    extracted = await extract_invoice_from_image(image_path)
    extracted["category"] = await categorize_expense(
        extracted["vendor_name"],
        float(extracted["amount"]),
        extracted["description"],
    )
    return extracted
