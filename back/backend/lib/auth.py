from backend.models.user import User
from flask import session


def logged_in():
    return "wca_account_number" in session


def user():
    if not logged_in():
        return None

    wca_account_number = session["wca_account_number"]

    return User.get_by_id(wca_account_number)
