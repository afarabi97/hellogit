import binascii
import re
from typing import Dict

from app.models import Model
from app.utils.utils import decode_password
from marshmallow import ValidationError


def has_consecutive_chars(password: str) -> bool:
    """
    Checks if the password has more than 2 of the same consecutive character.
    """
    same = 1
    cached = None
    for index, character in enumerate(password):
        if index == 0:
            cached = character
            same = 1
        else:
            if cached == character:
                same += 1
            else:
                if same > 2:
                    return True
                same = 1
                cached = character
    return False


def validate_password_stigs(value: str) -> None:
    """
    Raises an exception when there are password violations
    """
    password = _is_base64(value)

    errors = []
    if len(password) < 15:
        errors.append("The password must be at least 15 characters.")

    if not re.search("[0-9]", password):
        errors.append("The password must have at least 1 digit.")

    if not re.search("[a-z]", password):
        errors.append("The password must have at least 1 lowercase letter.")

    if not re.search("[A-Z]", password):
        errors.append("The password must have at least 1 uppercase letter.")

    if not re.search("[^0-9a-zA-Z]", password):
        errors.append("The password must have at least 1 symbol.")

    if len(set(password)) < 8:
        errors.append("The password must have at least 8 unique characters.")

    if has_consecutive_chars(password):
        errors.append(
            "The password must not have 3 consecutive characters that are the same."
        )

    if len(errors) > 0:
        raise ValidationError(errors)


def _is_base64(value: str):
    """
    Returns decoded string if it's base64 encoded otherwise returns original string.
    """
    try:
        return decode_password(value)
    except binascii.Error:
        return value


class SettingsBase(Model):
    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_kickstart = cls.schema.load(payload)  # type: KitSettingsForm
        return new_kickstart
