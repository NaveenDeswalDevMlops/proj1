from pathlib import Path
from PIL import Image, ImageDraw
import qrcode


def _draw_rosette(draw: ImageDraw.ImageDraw):
    center = (750, 130)
    gold = "#D4AF37"
    navy = "#0F2E67"

    for i in range(12):
        offset = (i % 2) * 6
        x0 = center[0] - 78 - offset
        y0 = center[1] - 78 - offset
        x1 = center[0] + 78 + offset
        y1 = center[1] + 78 + offset
        draw.ellipse((x0, y0, x1, y1), outline=gold, width=2)

    draw.ellipse((center[0] - 58, center[1] - 58, center[0] + 58, center[1] + 58), fill=gold)
    draw.ellipse((center[0] - 42, center[1] - 42, center[0] + 42, center[1] + 42), fill=navy)

    draw.polygon([(710, 200), (735, 285), (770, 200)], fill=navy)
    draw.polygon([(742, 200), (778, 292), (810, 200)], fill=navy)


def generate_badge(
    badge_name: str,
    badge_id: str,
    fy: str,
    requestor_name: str,
    generated_date: str,
    expiry_date: str,
):
    Path("app/static/badges").mkdir(parents=True, exist_ok=True)

    img = Image.new("RGB", (1000, 620), color="#07162D")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle((25, 25, 975, 595), radius=24, outline="#1E3A8A", width=3)
    _draw_rosette(draw)

    draw.text((50, 55), "Nation Builder Badge", fill="white")
    draw.text((50, 120), f"Badge Tier: {badge_name}", fill="white")
    draw.text((50, 165), f"Financial Year: {fy}", fill="white")
    draw.text((50, 210), f"Unique Badge ID: {badge_id}", fill="white")
    draw.text((50, 255), f"Generated On: {generated_date}", fill="white")
    draw.text((50, 300), f"Expires On: {expiry_date}", fill="white")
    draw.text((50, 345), f"Awarded To: {requestor_name}", fill="white")
    draw.text((50, 410), "Thank you for nation building through your tax contribution.", fill="#FDE68A")

    qr_url = f"http://127.0.0.1:8000/verify/{badge_id}"
    qr = qrcode.make(qr_url).resize((190, 190))
    img.paste(qr, (760, 360))

    path = f"app/static/badges/{badge_id}.png"
    img.save(path)
    return path
