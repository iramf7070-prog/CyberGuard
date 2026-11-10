
import re
import math
from collections import Counter
from urllib.parse import urlparse, parse_qs


def extract_features(url):
    try:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        parsed = urlparse(url)
        host = parsed.hostname or ""
        domain_parts = host.split(".")

        domain_name = domain_parts[-2] if len(domain_parts) >= 2 else host
        tld = domain_parts[-1] if len(domain_parts) >= 2 else ""

        # URL entropy
        counts = Counter(url)
        entropy = -sum(
            (count / len(url)) * math.log2(count / len(url))
            for count in counts.values()
        ) if url else 0

        # Numeric character percentage
        numeric_percentage = (
            sum(char.isdigit() for char in url) / len(url) * 100
            if url else 0
        )

        suspicious_extensions = (
            ".exe", ".zip", ".rar", ".scr",
            ".bat", ".js", ".apk"
        )

        features = {
            "url_length": len(url),
            "has_ip_address": int(bool(re.match(
                r"^\d{1,3}(\.\d{1,3}){3}$", host
            ))),
            "dot_count": url.count("."),
            "https_flag": int(parsed.scheme == "https"),
            "url_entropy": entropy,
            "token_count": len(re.findall(r"[a-zA-Z0-9]+", url)),
            "subdomain_count": max(0, len(domain_parts) - 2),
            "query_param_count": len(parse_qs(parsed.query)),
            "tld_length": len(tld),
            "path_length": len(parsed.path),
            "has_hyphen_in_domain": int("-" in host),
            "number_of_digits": sum(char.isdigit() for char in url),
            "tld_popularity": 1 if tld in (
                "com", "org", "net", "edu", "gov"
            ) else 0,
            "suspicious_file_extension": int(
                parsed.path.lower().endswith(suspicious_extensions)
            ),
            "domain_name_length": len(domain_name),
            "percentage_numeric_chars": numeric_percentage
        }

        return features

    except Exception as error:
        raise ValueError(f"URL feature extraction failed: {error}")
