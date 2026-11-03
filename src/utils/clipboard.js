export async function copyToClipboard(text) {
  if (typeof text !== "string") return false;

  if (
    typeof navigator !== "undefined" &&
    typeof window !== "undefined" &&
    window.isSecureContext &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back when clipboard permission is unavailable.
    }
  }

  if (typeof document === "undefined" || !document.body || typeof document.execCommand !== "function") {
    return false;
  }

  const textarea = document.createElement("textarea");
  const activeElement = document.activeElement;
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.tabIndex = -1;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  try {
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (activeElement?.isConnected && activeElement !== document.body) {
      try {
        activeElement.focus({ preventScroll: true });
      } catch {
        // Clipboard success should not depend on restoring focus.
      }
    }
  }
}
