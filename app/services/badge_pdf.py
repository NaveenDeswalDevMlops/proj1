from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def generate_badge_pdf(badge_name, badge_id, fy):
    path = f"app/static/badges/{badge_id}.pdf"
    c = canvas.Canvas(path, pagesize=A4)

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(300, 750, "Nation Builder Badge")

    c.setFont("Helvetica", 14)
    c.drawString(100, 650, f"Badge: {badge_name}")
    c.drawString(100, 620, f"Financial Year: {fy}")
    c.drawString(100, 590, f"Badge ID: {badge_id}")

    c.drawString(100, 520, "Verify at:")
    c.drawString(100, 500, f"/verify/{badge_id}")

    c.save()
    return path
