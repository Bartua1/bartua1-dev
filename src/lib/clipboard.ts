/**
 * Copies the given text to the clipboard.
 * Falls back to document.execCommand('copy') in non-secure contexts (HTTP) or older browsers.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, trying fallback:', err);
    }
  }

  // Fallback for non-secure contexts (e.g. HTTP on a local network / Raspberry Pi)
  if (typeof document !== 'undefined' && document.execCommand) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent zooming and styling issues on iOS
    textarea.style.fontSize = '12pt';
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.setAttribute('aria-hidden', 'true');

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    try {
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error('Fallback document.execCommand copy failed:', err);
      document.body.removeChild(textarea);
      return false;
    }
  }

  return false;
}
