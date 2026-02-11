from PIL import Image, ImageDraw
import qrcode

def generate_badge(badge_name: str, badge_id: str, fy: str):
    # Base image
    img = Image.new("RGB", (700, 450), color="#0B1C2D")
    draw = ImageDraw.Draw(img)

    # Text
    draw.text((40, 40), "Nation Builder Badge", fill="white")
    draw.text((40, 120), f"Badge: {badge_name}", fill="white")
    draw.text((40, 170), f"Financial Year: {fy}", fill="white")
    draw.text((40, 220), f"Badge ID: {badge_id}", fill="white")

    # QR Code
    qr_url = f"http://127.0.0.1:8000/verify/{badge_id}"
    qr = qrcode.make(qr_url)
    qr = qr.resize((160, 160))

    img.paste(qr, (480, 240))

    path = f"app/static/badges/{badge_id}.png"
    img.save(path)

    return path
