// === Utility functions ===
function replaceInStories(stories, contextLabel) {
    app.findTextPreferences = NothingEnum.NOTHING;
    app.changeTextPreferences = NothingEnum.NOTHING;

    for (var i = 0; i < stories.length; i++) {
        for (var oldCode in replacements) {
            app.findTextPreferences.findWhat = oldCode;
            app.changeTextPreferences.changeTo = replacements[oldCode];

            var changes = stories[i].changeText();
            var changeCount = (changes && changes.length) || 0;
            totalChanges += changeCount;

            if (changeCount > 0) {
                logDetails += contextLabel + " — \"" + oldCode + "\" → \"" + replacements[oldCode] + "\": " + changeCount + " replacements\n";
            }
        }
    }
}

function showLargeLogDialog(title, message) {
    var dlg = new Window("dialog", title);
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "fill"];
    dlg.preferredSize = [600, 400];

    var logText = dlg.add("edittext", undefined, message, { multiline: true, scrolling: true });
    logText.minimumSize = [580, 360];
    logText.alignment = ["fill", "fill"];

    var btnGroup = dlg.add("group");
    btnGroup.alignment = "right";
    btnGroup.add("button", undefined, "OK", { name: "ok" });

    dlg.center();
    dlg.show();
}

// === Main execution ===
try {
    if (app.documents.length === 0) {
        alert("Please open a document before running the script.");
        exit();
    }

    var replacements = {
        "LS-B-127": "LSB127",
        "LS‑B‑127": "LSB127" // Non-breaking hyphens
    };

    app.findChangeTextOptions.caseSensitive = false;
    app.findChangeTextOptions.wholeWord = true;

    var totalChanges = 0;
    var logDetails = "📋 Text Replacement Log\n\n";

    // Replace in document stories
    replaceInStories(app.activeDocument.stories, "Document Pages");

    // Replace in master spread stories (avoid duplicates)
    var masterSpreads = app.activeDocument.masterSpreads;
    for (var m = 0; m < masterSpreads.length; m++) {
        var spread = masterSpreads[m];
        var textFrames = spread.textFrames;
        var masterStories = [];

        for (var t = 0; t < textFrames.length; t++) {
            var story = textFrames[t].parentStory;

            // Defensive duplicate check
            var found = false;
            for (var s = 0; s < masterStories.length; s++) {
                if (masterStories[s] === story) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                masterStories.push(story);
            }
        }

        replaceInStories(masterStories, "Parent Page: " + spread.name);
    }

    // Reset preferences
    app.findTextPreferences = NothingEnum.NOTHING;
    app.changeTextPreferences = NothingEnum.NOTHING;

    showLargeLogDialog("✅ Product codes updated successfully", logDetails + "\nTotal Replacements: " + totalChanges);

} catch (e) {
    alert("⚠️ Script error:\n" + e.message);
}
