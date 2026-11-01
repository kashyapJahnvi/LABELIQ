# LABELIQ Firestore Security Specification

## 1. Data Invariants

1. **User Ownership Invariant**:
   - Every scan record at `/users/{userId}/scans/{scanId}` must have `userId == request.auth.uid` and path variable `{userId} == request.auth.uid`.
   - Users can never read, modify, query, or delete another user's scan history.

2. **Feedback Isolation & Admin Review Invariant**:
   - Feedback at `/feedback/{feedbackId}` can only be created by an authenticated user where `incoming().userId == request.auth.uid`.
   - Normal users can only read their own feedback (`resource.data.userId == request.auth.uid`).
   - Only authorized administrators (`exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or matching `request.auth.token.email == 'jahnvith80@gmail.com'`) can list all feedback and update ticket status, admin notes, and assigned admins.
   - Non-admin users cannot alter ticket status, admin notes, or assigned admins.

3. **Tutorial Progress Invariant**:
   - Document at `/users/{userId}/tutorial/progress` must have `{userId} == request.auth.uid`.
   - Only the authenticated owner can read and update their own progress.

4. **Admin Protection Invariant**:
   - `/admins/{userId}` can only be read by signed-in users for role checks; writes are locked down completely (write: if false).

5. **Path Hardening & ID Integrity**:
   - Document IDs must satisfy `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_-]+$')`).
   - All string fields are constrained with strict `.size()` checks.

6. **Default-Deny Catch-All**:
   - Every document path not explicitly authorized is closed by `match /{document=**} { allow read, write: if false; }`.

---

## 2. The Dirty Dozen Malicious Payloads

1. **Payload 1: ID Spoofing in Scan Record**
   - Attempt: User `userA` creates `/users/userB/scans/scan_1` with `userId: "userA"`.
   - Expected: `PERMISSION_DENIED`.
2. **Payload 2: Cross-User Scan List Attempt**
   - Attempt: User `userA` lists `/users/userB/scans`.
   - Expected: `PERMISSION_DENIED`.
3. **Payload 3: Arbitrary ID Injection / Denial-of-Wallet Attack**
   - Attempt: Write doc with a 2KB malicious junk string as `scanId`.
   - Expected: `PERMISSION_DENIED` via `isValidId()`.
4. **Payload 4: Feedback Privilege Escalation**
   - Attempt: Non-admin user submits `/feedback/fb_1` with `status: "Resolved"` or updates `adminNotes: "hacked"`.
   - Expected: `PERMISSION_DENIED`.
5. **Payload 5: Feedback Shadow Field Attack**
   - Attempt: User submits feedback with unauthorized fields (e.g. `role: "admin"`, `isAdmin: true`).
   - Expected: `PERMISSION_DENIED`.
6. **Payload 6: Read Other User's Feedback**
   - Attempt: User `userA` reads `/feedback/fb_userB`.
   - Expected: `PERMISSION_DENIED`.
7. **Payload 7: Unauthenticated Scan History Query**
   - Attempt: Unauthenticated client requests `/users/userA/scans`.
   - Expected: `PERMISSION_DENIED`.
8. **Payload 8: Self-Admin Elevation**
   - Attempt: Authenticated user writes a document to `/admins/$(request.auth.uid)`.
   - Expected: `PERMISSION_DENIED`.
9. **Payload 9: Cross-User Scan Deletion**
   - Attempt: User `userA` sends `delete` on `/users/userB/scans/scan_1`.
   - Expected: `PERMISSION_DENIED`.
10. **Payload 10: Tutorial Progress Tampering**
    - Attempt: User `userA` overwrites `/users/userB/tutorial/progress`.
    - Expected: `PERMISSION_DENIED`.
11. **Payload 11: Oversized Payload String Injection**
    - Attempt: Inject 100KB string into `productName` or `brand`.
    - Expected: `PERMISSION_DENIED` via size limits.
12. **Payload 12: Blank Feedback Comment**
    - Attempt: Submit feedback without required fields or empty comment.
    - Expected: `PERMISSION_DENIED`.
