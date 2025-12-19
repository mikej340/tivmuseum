## High priority

- Add museum repository and Google sheet
- running total wont update on new day until after first submission
- On app script error return in response
- How to Roll out new location picker?
- After putting in auth key, keyboard can’t be dismissed easily
- documentation
  - Adding new fields
  - Private key
  - App Script (we obviously have url in webpage but still)
    - Deployment notes; need to update url in web page
- Offline mode (fallback if no internet)
- Write a human-centered README
  - Not just “how it works,” but “why it’s built this way.”
  - Explain:
    - That it’s intentionally static (cheap, low-maintenance)
    - That it could be rehosted easily (HTML + JS)
    - That it’s secure and doesn’t need a backend
    - You’re not just documenting code — you’re leaving care instructions.
- End of day / reconciliation
  - end of day totals
  - Reconciliation. Even if Carrie gets from spreadsheet or something
  - Enter footfall figure? Low priority
  - Link (from menu?) to spreadsheet
    - Pippa can share login with Shirley/Carrie/anyone she trusts to make changes
  - review Pippa reports


## Low priority

- Might as well remove the letters and numbers from the drop-downs
- Yes no as buttons or toggle rather than dropdown
- link to GitHub, documentation, sheet
- order of select items
- Maybe don’t load form options unless changed… tho probably won’t take any less time…


## Further consideration required

- Surely if reason for visit is local wherever that local option is then the how you heard about us is always local resident or else local resident shouldn't be a how you heard about us option
- More consideration around how did you hear about us vs how did you hear about X event
- Events column maybe, and maybe ability to set up and configure events
- Database / data model:
  - Normalise database? I.e. party (survey stuff, total price?) -> visitors (ticket type, qty, price, gift aid)
  - proper DB?
  - Need DB IDs?
- Is Holiday Activities used for people on holiday? I thought it was for eg Halloween event
- Dashboard / Kiosk dashboard
  - Consider turning app/page into a “Kiosk Dashboard” or some shit; visitor counter, common web links, current surveys, activities, newsletter, calendar, email Pippa, Carrie. 🤷
- figure out how gonna manage submissions
  - with ability to edit?
