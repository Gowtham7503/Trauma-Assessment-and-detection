def validate_complaint(
    complaint
):

    if not complaint:

        return (
            False,
            "Complaint is required."
        )

    if not isinstance(
        complaint,
        str
    ):

        return (
            False,
            "Complaint must be text."
        )

    complaint = complaint.strip()

    if len(complaint) < 5:

        return (
            False,
            "Complaint is too short."
        )

    if len(complaint) > 5000:

        return (
            False,
            "Complaint is too long."
        )

    return (
        True,
        None
    )


def validate_answers(
    answers
):

    if not answers:

        return (
            False,
            "Answers are required."
        )

    if not isinstance(
        answers,
        list
    ):

        return (
            False,
            "Answers must be a list."
        )

    for answer in answers:

        if "question_id" not in answer:

            return (
                False,
                "Question ID is missing."
            )

        if "answer" not in answer:

            return (
                False,
                "Answer is missing."
            )

    return (
        True,
        None
    )