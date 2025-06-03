# 🧾 Museum Visitor Register – Discussion Points

## 🧭 Purpose & Vision
- **Overview**: Intuitive tablet-based digital visitor register to replace manual entry.
- **Goal**: Reduce errors, improve data consistency, streamline daily summaries, and eventually integrate with museum systems.

---

## ✅ Anticipated Benefits
- **Fewer errors**: Automatic price/gift aid calculations can flag till mismatches.
- **Faster entries**: Pre-filled options for common categories (e.g. walk-in, just visiting).
- **Geographic automation**: Auto-generates postcode-based breakdowns.
- **Day totals**: Form calculates daily totals (integration with museum IT pending).
- **Accessibility**: Large controls, pinch-to-zoom, compatible with styluses (e.g. for users with long nails). Lil should be able to use - has tested and seems positive.
- **Scalability**: Static site (HTML + JS) can be easily rehosted; low maintenance.

---

## ⚠️ Potential Drawbacks & Concerns
- **Single point of failure**: Currently only Mike can maintain or update the system.
- **User resistance**: Some staff may prefer traditional methods.
- **Shirley’s concern**: Worries about role redundancy, though enjoys using the system.
- **IT support**: Long-term sustainability may require museum IT involvement.
- **Training**: Minimal training required, especially for less tech-confident users.

---

## 🤝 Stakeholder Status
- **Shirley**: Has tested it; positive overall (some UI suggestions).
- **Pippa**: Very supportive.
- **Carrie**: Engaged.
- **Emma / Volunteers**: To be looped in.

---

## 💡 Feasibility & Hosting
- **Security**: No backend needed; data is handled client-side. Private key for authorisation. Google Sheets Workbook limited sharing.
- **Offline mode**: Consider basic fallback if internet is down.
- **Deployment**: Runs well on Android tablet via webview (Galaxy Tab A tested).

---

## 🤔 Questions & Unknowns
- **Purposes of records**: what currently used for? Could we capture better/more?
- **Membership handling**:
  - What’s recorded on a member’s *first* visit?
  - How to handle membership *upgrades* after an initial visit?
  - Should members be asked for more/different data?
- **Survey/country codes/Reason for visit/Heard about**: Should be reviewed for clarity and usefulness.
- **Geographic categorization**: How granular? Tiverton vs Devon vs UK vs International? (Think already decided postcode)
- **Group discounts**: Clarified via email — confirm shared understanding.
- **Alternative processes**: 
  - record all visitors in till - not via register?
  - allow visitor to fill out some?
- **Historic data**: possible to port over? Different data formats/sources to collate for Pippa (so could consider switching over end of year?)

---

## 🛠️ Suggested Improvements / Features
- **Geo defaults**: Possibly default to Tiverton, with options for other local areas.
- **Edit/review mode**: Allow corrections or updates post-submission.
- **Submission feedback**: Could display calculated total to be entered into till.
- **Kiosk dashboard**: Consider expanding interface to include:
  - Visitor counter
  - Common links (e.g. surveys, newsletter, activities)
  - Quick contact buttons for Carrie/Pippa/Mike (feedback?)
- **Visitor categories**:
  - Useful to distinguish *Admitted Visitors* from *Non-Admitted* (e.g. TIC, Shop-only, Tots).
- **Integrating with booking systems?**

---

## 📦 Rollout & Sustainability
- **Adoption**: inevitable resistance. Consider feasibility tests? - ask vols to use during a shift? Alongside (after) paper record? (poss even add col to sheet: "App?")
- **Documentation**:
  - Write a clear README focused on *purpose* as well as functionality.
  - Explain:
    - Why it’s a static site (cost, simplicity, durability).
    - How it can be rehosted easily.
    - That it’s secure and doesn’t require a backend.
  - Leave “care instructions” for future maintainers.
- **Process & governance**:
  - Define primary contacts for changes/reviews (Pippa, Carrie, Kate?).
  - Establish process for updating fields, deployments, feedback.