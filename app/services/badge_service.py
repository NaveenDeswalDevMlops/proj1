BADGE_TIERS = [
    (100000, 299999, "Silver Contributor"),
    (300000, 599999, "Gold Contributor"),
    (600000, 999999, "Platinum Contributor"),
    (1000000, 2499999, "Diamond Nation Builder"),
    (2500000, float("inf"), "Bharat Ratna Contributor"),
]

def get_badge_for_tax(tax_paid: int) -> str:
    for min_tax, max_tax, badge in BADGE_TIERS:
        if min_tax <= tax_paid <= max_tax:
            return badge
    return "Not Eligible"
