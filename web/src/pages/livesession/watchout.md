The cleanest no-signup fix: remove the IFrame approach entirely and use a direct Jitsi URL in an iframe with the #config. hash params — this bypasses the Jitsi external api's auth interception. Let me do both fixes now:



2. Can't join at all — root cause & fix: The auto-trigger useEffect was referencing handleJoin / handleCreate before they were declared in the same render cycle (JavaScript const isn't hoisted). Fixed by declaring the handlers first, then the effect.

What's the same:

Name auto-fills from your logged-in user profile
Logged-in users auto-join/create without touching the form
Guest flow (not logged in) shows the form as before
Trade-off: The iframe approach hands off mic/cam controls to Jitsi's own UI inside the iframe. I kept the Leave button in your top bar (which navigates away), but mute/camera toggles in your custom bar won't work via the External API commands anymore — use Jitsi's built-in controls inside the iframe instead.


Domain change (the key fix): Switched from meet.jit.si → meet.ffmuc.net — a community-run Jitsi where the first person to join is automatically the moderator, no login required.

Backend (LiveSessionService.java):