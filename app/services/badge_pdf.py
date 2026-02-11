from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def generate_badge_pdf(
    badge_name: str,
    badge_id: str,
    fy: str,
    requestor_name: str,
    generated_date: str,
    expiry_date: str,
):
    Path("app/static/badges").mkdir(parents=True, exist_ok=True)

    path = f"app/static/badges/{badge_id}.pdf"
    c = canvas.Canvas(path, pagesize=A4)

    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(300, 780, "Nation Builder Badge")

    c.setFont("Helvetica", 13)
    c.drawString(70, 710, f"Badge Tier: {badge_name}")
    c.drawString(70, 685, f"Badge ID: {badge_id}")
    c.drawString(70, 660, f"Financial Year: {fy}")
    c.drawString(70, 635, f"Generated On: {generated_date}")
    c.drawString(70, 610, f"Expires On: {expiry_date}")
    c.drawString(70, 585, f"Awarded To: {requestor_name}")

    c.setFont("Helvetica-Oblique", 12)
    c.drawString(70, 535, "Thank you for nation building through your tax contribution.")

    c.setFont("Helvetica", 12)
    c.drawString(70, 495, f"Verify this badge: http://127.0.0.1:8000/verify/{badge_id}")

    c.save()
    return path
