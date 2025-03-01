CAT Asset Id              | [your CAT asset id/tail hash here]
:-------------------------|:----
SpaceScan CAT Page        | [url]
Dexie CAT Page            | [url]
TibetSwap Pair Page       | [url]
Base Contract Address     | [address + BaseScan URL]
Docs PR                   | [url]
Watcher PR                | [url]
Test Bridge (XCH -> Base) | [explorer url]
Test Bridge (Base -> XCH) | [explorer url]

## Process Steps

**Do not modify anything after this sentence.** The maintainer handling this listing request will take the steps below (subject to change). As mentioned in the documentation, the warp.green team reserves the right to approve/reject pull requests on a case-by-case basis.
 * Ensure information (token name & symbol) is consistent across SpaceScan, Dexie, and TibetSwap
 * Ensure no other well-known CATs use the same ticker
 * Verify that the Base contract contains the correct code and has been initialized with the correct puzzle hashes (via CLI)
 * Check the current PR changes. If the token ticker might be misleading, make sure an appropriate `additionalWarning` is set.
 * Check test bridging transactions were correct and successful
 * Check & approve the documentation PR
 * Check & approve the watcher PR
 * Update the watcher to run the latest version
 * Approve this PR