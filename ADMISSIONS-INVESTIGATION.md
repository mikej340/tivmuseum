# Duplicate admissions investigation — 16 September 2026

Reported: duplicate admissions beginning on 11 September, potentially after
a saved submission failed to clear the form or display success.

## Findings

Fetched remote main and fast-forwarded the clean checkout to `41cc9c0`.
Remote main's latest commit is dated 7 August 2026; its tracked files matched
the initial local checkout. There is no repository change around 11 September
to explain the onset. This does not establish which code is deployed in Apps
Script or cached on the admissions devices.

The confirmation click handler disabled the form's Submit button but left
the modal's confirmation button enabled and had no in-flight guard. Repeated
confirmation taps during the modal's closing transition could send multiple
POSTs. The POST used plain `fetch`, so it did not automatically retry.

The server appended every authenticated valid request. If a row saved but
the response was lost or unreadable, the form displayed an error and retained
its values. Submitting again created a new timestamp and appended another row.

Success handling showed the modal before resetting the form. A synchronous
exception in that display step could enter the error handler after a confirmed
save and leave the saved form available to resubmit.

The uploaded `Museum Visitors.xlsx` provides 1,883 timestamped admission
records from 14 November 2025 through 16 September 2026. Its `Visitors` tab
contains two suspicious groups since 11 September:

| Date | Spreadsheet rows | Evidence | Potential overstatement if confirmed |
| --- | --- | --- | --- |
| 11 September | 1849–1851 | All submitted admission fields match. Timestamps are 12:03:01.273, 12:04:02.946 and 12:04:16.438, gaps of 61.673 and 13.492 seconds. Each row records two standard visitors and £19. | Four visitors and £38 if one admission was submitted three times. |
| 15 September | 1875–1876 | Every field, including timestamp, matches: one standard visitor, £9.50, 14:07:00. Survey fields are blank. | One visitor and £9.50 if one admission was entered twice. |

The 11 September timing supports repeated submissions after an uncertain
response rather than a rapid double tap. It remains possible these were
separate parties with identical answers; the workbook alone cannot establish
what users saw or whether a network response failed.

The 15 September pair appears among entries with whole-minute timestamps
and blank postcode/reason/first-visit/heard-about-us fields. Rows 1874–1877
are dated 15 September but follow row 1873, dated 16 September at 10:09:56.685.
The user confirms that there is no manual or retrospective entry. The earlier
suggestion of backfilling is therefore withdrawn. These are unexplained
anomalies, not evidence of manual entry. The normal form requires these survey
fields for standard tickets and creates a current timestamp. Required-field
checks are enforced by the browser when opening confirmation, but the final
confirmation handler does not revalidate and the server does not reject
missing survey fields. This is a validation gap; the workbook does not show
which path caused the blanks or timestamp anomalies.

Compared every submitted field (columns A–T), excluding timestamps and
derived columns, and looked for identical records within five minutes on
the same day. No further matching groups were found on 12 or 16 September,
or 1–10 September in this copy. Earlier candidates exist, including rows
1510–1511 on 12 August (21.810 seconds apart) and rows 1531–1533 on 13 August
(148.495 and 29.356 seconds apart). The copy therefore does not establish a
new issue beginning on 11 September or systematic doubling of all entries.
This test can miss retries with edited answers or longer delays and can flag
legitimate identical visits.

If both September groups are confirmed duplicates, the combined overstatement
is five visitors and £47.50 of recorded admission price, with no duplicate
donation. This is a conditional estimate, not evidence of extra payments.
No uploaded or live spreadsheet rows were edited or deleted.

The root cause of the failed acknowledgement still requires the deployed
Apps Script version and execution logs, or reproduction on an admissions
device. The accessible Google Drive file only runs through December 2025;
the September evidence above comes from the uploaded copy.

## Prepared changes

- Keep surveys visible and required for every admission, including members,
  as clarified by the user. Remove the obsolete members-only exemption and
  message instead of correcting its selector and enabling unwanted behaviour.
  The public page reads `members`, while the supplied config creates `member`;
  this accidental mismatch already produces the desired behaviour. It does
  not explain the blank standard-ticket rows.
- Keep survey requirements in the HTML and check browser validity in the final
  confirmation handler. Member additions/removals, mixed adults and accompanying
  children all retain visible, required surveys in regression checks. The
  origin of the September blank rows remains a separate unresolved issue.
- Guard confirmation and form submission while a POST is in flight, disable
  confirmation, and prevent editing/resetting the visit while saving.
- Preserve a request UUID and timestamp for unchanged retries in the same
  tab, including after reload using session storage.
- Store the UUID in a new trailing `submission-id` column. Check and append
  under a script lock; a previously saved ID returns `Success` without appending.
  Flush spreadsheet writes before releasing the lock, following Google's
  [Lock guidance](https://developers.google.com/apps-script/reference/lock/lock).
- Reset before optional success display/totals updates. Distinguish uncertain
  saves from display failures after a confirmed save in the error message.

No production deployment or historical row cleanup was performed.
Deploy backend first, then release the form and reload admissions devices.
Existing clients without a UUID remain compatible but lack retry protection.
Resetting, changing the record, or using another tab creates a new identity;
identical legitimate visits are deliberately not deduplicated by their answers.

## Verification

`node --test tests/submission.test.cjs` passes ten regression tests covering
rapid taps, reset prevention during submission, response loss/retry/reload,
server restart persistence, identical legitimate visits, legacy compatibility,
invalid/unauthorized requests, column alignment, lock/flush ordering, and
success display failure, members state transitions, and final confirmation
validation, UUID generation on plain HTTP LAN previews, and omission of trailing
computed cells when the ID column precedes them, including historical blank IDs.
These use browser
and Apps Script test doubles; they
do not establish production deployment or real device behavior.
