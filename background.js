let lastCommandTime = 0; // Debounce timing

chrome.commands.onCommand.addListener((command) => {
    const now = Date.now();

    // Debounce to prevent double execution
    if (now - lastCommandTime < 300) return;
    lastCommandTime = now;

    if (command === "prepend-emoji") {
        handleBookmark(addOneFire, "fire"); // Add one 🔥
    } else if (command === "remove-emoji") {
        handleBookmark(removeOneFire, "ice", true); // Remove one 🔥 or warn
    }
});

// Process bookmark updates
function handleBookmark(transformTitle, effect, warnIfNone = false) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
            chrome.bookmarks.search({ url: tab.url }, (results) => {
                if (results.length > 0) {
                    const bookmark = results[0];
                    const originalTitle = bookmark.title.trim();
                    const newTitle = transformTitle(originalTitle);

                    // Count fires in new title
                    const fireCount = (newTitle.match(/^(🔥+)?(.*)/) || []).length;

                    if (newTitle === originalTitle && warnIfNone) {
                        sendEffectToTab("warning", fireCount); // Show warning
                    } else {
                        // Update bookmark and force refresh
                        chrome.bookmarks.update(bookmark.id, { title: newTitle }, () => {
                            // Fetch the updated title after 100ms for consistency
                            setTimeout(() => {
                                chrome.bookmarks.get(bookmark.id, (updated) => {
                                    const updatedCount = (updated[0].title.match(/🔥/g) || []).length;
                                    sendEffectToTab(effect, updatedCount); // Visual feedback
                                });
                            }, 100); // Allow time for Chrome to sync
                        });
                    }
                } else {
                    sendEffectToTab("warning"); // No bookmark, show warning
                }
            });
        }
    });
}

// Add ONE 🔥 emoji
function addOneFire(title) {
    const match = title.match(/^(🔥+)?(.*)/); // Match fires and text
    const fires = match[1] ? match[1].length : 1; // Count existing fires, or add one!
    const rest = match[2] ? match[2].trim() : ""; // Extract the rest

    return "🔥".repeat(fires) + rest; // Add exactly ONE 🔥
}

// Remove ONE 🔥 emoji
function removeOneFire(title) {
    const match = title.match(/^(🔥+)?(.*)/); // Match fires and text
    const fires = match[1] ? match[1].length : 0; // Count existing fires
    const rest = match[2] ? match[2].trim() : ""; // Extract the rest

    // alert(fires);

    if (fires > 1) {
        return "🔥".repeat(fires-2) + rest; // Remove ONE 🔥
    }
    return rest; // No fires left—return plain title
}

// Send visual effect
function sendEffectToTab(effect, count = "") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (effect, count) => {
                    document.body.dispatchEvent(
                        new CustomEvent("bookmarkEffect", { detail: { effect, count } })
                    );
                },
                args: [effect, count]
            });
        }
    });
}
