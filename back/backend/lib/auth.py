from flask import session

from backend.models.user import User


def logged_in():
    return 'wca_account_number' in session


def user():
    if not logged_in():
        return False

    wca_account_number = session['wca_account_number']

    user = User.get_by_id(wca_account_number)
    return user
