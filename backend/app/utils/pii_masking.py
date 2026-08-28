import re


def mask_email(text):

    return re.sub(
        r'[\w\.-]+@[\w\.-]+\.\w+',
        '[EMAIL]',
        text
    )


def mask_phone(text):

    return re.sub(
        r'\b\d{10}\b',
        '[PHONE]',
        text
    )


def mask_pii(text):

    if not text:
        return text

    text = mask_email(text)

    text = mask_phone(text)

    return text