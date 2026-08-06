import datetime
import logging

import requests
from backend.models.championship import Championship
from google.cloud import ndb

logger = logging.getLogger(__name__)


def email_championship_organizers():
    """Send emails to championship organizers for upcoming competitions.
    This is a simplified version adapted for Speedcubing Canada.
    Email functionality would need to be implemented based on the
    chosen email service (SendGrid, Mailgun, etc.).
    """
    logger.info("Checking for upcoming championships to email organizers...")

    all_championships = list(Championship.query().iter())
    all_championship_competitions = ndb.get_multi([c.competition for c in all_championships])

    upcoming_championships = []

    for comp, championship in zip(all_championship_competitions, all_championships, strict=False):
        if not comp:
            continue

        # Check if competition is upcoming (within next 14 days)
        start_date = datetime.date(comp.year, comp.month, comp.day)
        if start_date < datetime.date.today() or start_date > datetime.date.today() + datetime.timedelta(days=14):
            continue

        # Skip if email already sent
        if hasattr(championship, "organizer_email_sent") and championship.organizer_email_sent:
            continue

        # Skip national championships (handle differently)
        if championship.national_championship:
            continue

        upcoming_championships.append((comp, championship))

    logger.info("Found %d championships needing organizer emails", len(upcoming_championships))

    for comp, championship in upcoming_championships:
        logger.info("Processing championship: %s", comp.name)

        # Get competition details from WCA API
        try:
            response = requests.get(f"https://api.worldcubeassociation.org/competitions/{comp.key.id()}/wcif/public")
            if response.status_code != 200:
                logger.error("Failed to get WCIF for %s: %s", comp.key.id(), response.status_code)
                continue

            competition_data = response.json()

            # Extract organizer/delegate emails
            organizer_user_ids = []
            for person in competition_data.get("persons", []):
                roles = person.get("roles", [])
                if any(role in ["delegate", "organizer", "trainee-delegate"] for role in roles):
                    organizer_user_ids.append(str(person["wcaUserId"]))

            if organizer_user_ids:
                logger.info("Found %d organizers/delegates for %s", len(organizer_user_ids), comp.name)

                # TODO: Implement email sending logic here
                # This would depend on the chosen email service
                # For now, just log what would be sent

                championship_type = "regional" if championship.region else "provincial"

                logger.info(
                    "Would send championship eligibility email for %s championship: %s",
                    championship_type,
                    comp.name,
                )
                logger.info("Recipients: %s", organizer_user_ids)

                # Mark as sent (for now, just log)
                # championship.organizer_email_sent = datetime.datetime.now()
                # championship.put()

            else:
                logger.warning("No organizer emails found for %s", comp.name)

        except Exception:
            logger.exception("Error processing %s", comp.name)

    logger.info("Championship organizer email check completed")


if __name__ == "__main__":
    email_championship_organizers()
