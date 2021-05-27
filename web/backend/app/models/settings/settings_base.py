import re
from app.models import Model, DBModelNotFound, PostValidationError
from marshmallow import ValidationError
from typing import List, Dict

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
    errors = []
    if len(value) < 15:
        errors.append("The password must be at least 15 characters.")

    if not re.search("[0-9]", value):
        errors.append("The password must have at least 1 digit.")

    if not re.search("[a-z]", value):
        errors.append("The password must have at least 1 lowercase letter.")

    if not re.search("[A-Z]", value):
        errors.append("The password must have at least 1 uppercase letter.")

    if not re.search("[^0-9a-zA-Z]", value):
        errors.append("The password must have at least 1 symbol.")

    if len(set(value)) < 8:
        errors.append("The password must have at least 8 unique characters.")

    if has_consecutive_chars(value):
        errors.append("The password must not have 3 consecutive characters that are the same.")

    if len(errors) > 0:
        raise ValidationError(errors)

class SettingsBase(Model):

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_kickstart = cls.schema.load(payload) # type: KitSettingsForm
        return new_kickstart
