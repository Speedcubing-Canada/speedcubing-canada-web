import datetime

# A member may change their own province at most once per rolling year. An admin editing
# another user from the dashboard isn't rate-limited (see handlers/user.py), but the change
# they make still records a UserLocationUpdate that counts toward that user's window.
PROVINCE_CHANGE_WINDOW = datetime.timedelta(days=365)


def most_recent_location_change_within_window(user, now):
    """Return the most recent ``UserLocationUpdate`` within the rate-limit window, else None.

    ``user.updates`` only gets an entry on an actual province change, so any in-window entry
    means the user already changed provinces in the last year. The first-ever change (no prior
    updates) returns ``None`` and is allowed.
    """
    cutoff = now - PROVINCE_CHANGE_WINDOW
    return max(
        (u for u in user.updates if u.update_time and u.update_time > cutoff),
        key=lambda u: u.update_time,
        default=None,
    )


def resolve_residency(user, deadline):
    """Return the province key the user resided in at ``deadline``.

    The latest location update *before* the deadline wins. If no update precedes the
    deadline — which happens for **past** championships when the user only set their
    province recently (the edit handler timestamps each ``UserLocationUpdate`` with
    ``now``) — fall back to the earliest recorded update's province as the baseline for
    earlier dates, rather than treating residency as unknown. If the user has no
    location updates at all, fall back to their current province.
    """
    if not user.updates:
        return user.province

    province = None
    for update in user.updates:
        if update.update_time < deadline:
            province = update.province
    if province is None:
        # The deadline precedes every recorded update; assume the earliest known
        # residency held for earlier dates too.
        province = min(user.updates, key=lambda u: u.update_time).province
    return province
