const DEFAULT_SENSITIVE_WORDS = {
  AxonActive: "CompanyX",
  "my\\.axonactive\\.vn\\.local": "localhost:8080",
};

let currentSensitiveWords = {};

// Load mappings
function loadMappings() {
  const saved = localStorage.getItem("sensitiveWordsMapping");
  if (saved) {
    try {
      currentSensitiveWords = JSON.parse(saved);
    } catch (e) {
      currentSensitiveWords = { ...DEFAULT_SENSITIVE_WORDS };
    }
  } else {
    currentSensitiveWords = { ...DEFAULT_SENSITIVE_WORDS };
  }

  let text = "";
  for (const [key, value] of Object.entries(currentSensitiveWords)) {
    text += `${key}:${value}\n`;
  }
  document.getElementById("rulesInput").value = text.trim();
}

// Save mappings
document.getElementById("saveRulesBtn").addEventListener("click", () => {
  const text = document.getElementById("rulesInput").value;
  const lines = text.split("\n");
  const newMappings = {};

  for (const line of lines) {
    if (!line.trim()) continue;
    // Split by first colon
    const colonIndex = line.indexOf(":");
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key) {
        newMappings[key] = value;
      }
    } else {
      // If no colon, default to masking it with "***"
      const key = line.trim();
      if (key) {
        newMappings[key] = "***";
      }
    }
  }

  currentSensitiveWords = newMappings;
  localStorage.setItem(
    "sensitiveWordsMapping",
    JSON.stringify(currentSensitiveWords),
  );

  const statusDiv = document.getElementById("saveStatus");
  statusDiv.style.display = "block";
  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 2000);
});

// Initialize on load
loadMappings();

document.getElementById("sanitizeBtn").addEventListener("click", () => {
  let inputCode = document.getElementById("codeInput").value;

  if (!inputCode.trim()) {
    alert("Please paste code here!");
    return;
  }

  let safeCode = inputCode;
  for (const [sensitiveWord, safeWord] of Object.entries(
    currentSensitiveWords,
  )) {
    try {
      const regex = new RegExp(sensitiveWord, "gi");
      safeCode = safeCode.replace(regex, safeWord);
    } catch (e) {
      console.error("Invalid regex: ", sensitiveWord);
      // Fallback to simple string replacement
      safeCode = safeCode.split(sensitiveWord).join(safeWord);
    }
  }

  document.getElementById("codeInput").value = safeCode;

  navigator.clipboard
    .writeText(safeCode)
    .then(() => {
      const statusDiv = document.getElementById("status");
      statusDiv.style.display = "block";
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 3000);
    })
    .catch((err) => {
      console.error("Failed to copy to clipboard: ", err);
      alert("Failed to copy to clipboard!");
    });
});
