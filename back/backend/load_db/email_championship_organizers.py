import collections
import datetime
import json
import logging
import re

from google.cloud import ndb
import requests

from backend.models.championship import Championship
from backend.models.user import User
from backend.models.wca.competition import Competition


def email_championship_organizers():
    """Send emails to championship organizers for upcoming competitions.
    
    This is a simplified version adapted for Speedcubing Canada.
    Email functionality would need to be implemented based on the
    chosen email service (SendGrid, Mailgun, etc.).
    """
    
    logging.info("Checking for upcoming championships to email organizers...")
    
    all_championships = list(Championship.query().iter())
    all_championship_competitions = ndb.get_multi([c.competition for c in all_championships])
    
    upcoming_championships = []
    
    for comp, championship in zip(all_championship_competitions, all_championships):
        if not comp:
            continue
            
        # Check if competition is upcoming (within next 14 days)
        start_date = datetime.date(comp.year, comp.month, comp.day)
        if start_date < datetime.date.today() or start_date > datetime.date.today() + datetime.timedelta(days=14):
            continue
            
        # Skip if email already sent
        if hasattr(championship, 'organizer_email_sent') and championship.organizer_email_sent:
            continue
            
        # Skip national championships (handle differently)
        if championship.national_championship:
            continue
            
        upcoming_championships.append((comp, championship))
    
    logging.info(f"Found {len(upcoming_championships)} championships needing organizer emails")
    
    for comp, championship in upcoming_championships:
        logging.info(f'Processing championship: {comp.name}')
        
        # Get competition details from WCA API
        try:
            response = requests.get(f'https://api.worldcubeassociation.org/competitions/{comp.key.id()}/wcif/public')
            if response.status_code != 200:
                logging.error(f'Failed to get WCIF for {comp.key.id()}: {response.status_code}')
                continue
                
            competition_data = response.json()
            
            # Extract organizer/delegate emails
            organizer_user_ids = []
            for person in competition_data.get('persons', []):
                roles = person.get('roles', [])
                if any(role in ['delegate', 'organizer', 'trainee-delegate'] for role in roles):
                    organizer_user_ids.append(str(person['wcaUserId']))
            
            if organizer_user_ids:
                logging.info(f'Found {len(organizer_user_ids)} organizers/delegates for {comp.name}')
                
                # TODO: Implement email sending logic here
                # This would depend on the chosen email service
                # For now, just log what would be sent
                
                championship_type = 'regional' if championship.region else 'provincial'
                
                logging.info(f'Would send championship eligibility email for {championship_type} championship: {comp.name}')
                logging.info(f'Recipients: {organizer_user_ids}')
                
                # Mark as sent (for now, just log)
                # championship.organizer_email_sent = datetime.datetime.now()
                # championship.put()
                
            else:
                logging.warning(f'No organizer emails found for {comp.name}')
                
        except Exception as e:
            logging.error(f'Error processing {comp.name}: {e}')
    
    logging.info("Championship organizer email check completed")


if __name__ == '__main__':
    email_championship_organizers()