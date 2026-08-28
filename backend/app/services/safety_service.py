def basic_safety_screen(text):

    if not text:

        return {
            "flagged": False,
            "reason": None
        }

    text_lower = text.lower()

    indicators = [
        "kill myself",
        "suicide",
        "suicidal",
        "want to die",
        "hurt myself",
        "harm myself",
        "end my life"
    ]

    for indicator in indicators:

        if indicator in text_lower:

            return {
                "flagged": True,
                "reason": (
                    "possible_immediate_"
                    "safety_concern"
                )
            }

    return {
        "flagged": False,
        "reason": None
    }