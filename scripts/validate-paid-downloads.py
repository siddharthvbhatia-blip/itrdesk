from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.references = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "script" and values.get("src"):
            self.references.append(values["src"])
        if tag == "link" and values.get("href") and values.get("rel") == "stylesheet":
            self.references.append(values["href"])


def validate_page(filename, required_ids, required_text):
    path = ROOT / filename
    assert path.exists(), f"Missing page: {filename}"
    content = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(content)

    duplicates = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
    assert not duplicates, f"Duplicate IDs in {filename}: {duplicates}"
    missing_ids = sorted(set(required_ids) - set(parser.ids))
    assert not missing_ids, f"Missing required IDs in {filename}: {missing_ids}"

    for expected in required_text:
        assert expected in content, f"Missing required text in {filename}: {expected}"

    for reference in parser.references:
        parsed = urlsplit(reference)
        if parsed.scheme or reference.startswith("//"):
            continue
        local_path = ROOT / parsed.path
        assert local_path.exists(), f"Broken local asset reference in {filename}: {reference}"


validate_page(
    "calculator.html",
    {
        "paidReportForm", "payForComputation", "downloadPaidPdf", "downloadPaidDocx",
        "paymentStatus", "paidDownloads"
    },
    {"₹1,000", "PDF", "editable Word"}
)

validate_page(
    "itr-preparation-json.html",
    {
        "itrJsonForm", "jsonDynamicPrice", "jsonHeadCount", "jsonTierMessage",
        "payForJsonDraft", "downloadJsonDraft", "downloadJsonPdf", "downloadJsonDocx",
        "jsonPaymentStatus", "jsonDownloads"
    },
    {
        "₹2,000", "₹2,500", "₹3,000", "JSON + computation (PDF + Word)",
        "before final submission to the Income Tax portal"
    }
)

for required_file in [
    "assets/payment.js", "assets/itr-preparation.js", "assets/download-suite-r30.css"
]:
    assert (ROOT / required_file).exists(), f"Missing required asset: {required_file}"

print("PASS paid computation and JSON bundle page structure")
print("PASS pricing, review warning and local asset references")