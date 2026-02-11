from pathlib import Path
from PIL import Image, ImageDraw
import qrcode


def generate_badge(
    badge_name: str,
    badge_id: str,
    fy: str,
    requestor_name: str,
    generated_date: str,
    expiry_date: str,
):
    Path("app/static/badges").mkdir(parents=True, exist_ok=True)

    img = Image.new("RGB", (900, 560), color="#0B1C2D")
    draw = ImageDraw.Draw(img)

    draw.text((40, 40), "Nation Builder Badge", fill="white")
    draw.text((40, 110), f"Badge Tier: {badge_name}", fill="white")
    draw.text((40, 155), f"Financial Year: {fy}", fill="white")
    draw.text((40, 200), f"Badge ID: {badge_id}", fill="white")
    draw.text((40, 245), f"Generated On: {generated_date}", fill="white")
    draw.text((40, 290), f"Expires On: {expiry_date}", fill="white")
    draw.text((40, 335), f"Awarded To: {requestor_name}", fill="white")
    draw.text((40, 395), "Thank you for nation building through your tax contribution.", fill="#FDE68A")

    qr_url = f"http://127.0.0.1:8000/verify/{badge_id}"
    qr = qrcode.make(qr_url).resize((190, 190))
    img.paste(qr, (670, 330))

    path = f"app/static/badges/{badge_id}.png"
    img.save(path)
    return path
