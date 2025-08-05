/**
 * Utility functions for markdown processing
 */

/**
 * Converts markdown text to plain text by removing markdown syntax
 * @param markdown - The markdown string to convert
 * @returns Plain text without markdown formatting
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';

  let plainText = markdown;

  // Remove headers (# ## ### etc.)
  plainText = plainText.replace(/^#{1,6}\s+/gm, '');

  // Remove bold and italic (**text**, *text*, __text__, _text_)
  plainText = plainText.replace(/\*\*([^*]+)\*\*/g, '$1');
  plainText = plainText.replace(/\*([^*]+)\*/g, '$1');
  plainText = plainText.replace(/__([^_]+)__/g, '$1');
  plainText = plainText.replace(/_([^_]+)_/g, '$1');

  // Remove strikethrough (~~text~~)
  plainText = plainText.replace(/~~([^~]+)~~/g, '$1');

  // Remove inline code (`code`)
  plainText = plainText.replace(/`([^`]+)`/g, '$1');

  // Remove code blocks (```code```)
  plainText = plainText.replace(/```[\s\S]*?```/g, '');

  // Remove links [text](url) -> text
  plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images ![alt](url)
  plainText = plainText.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove list markers (- * +)
  plainText = plainText.replace(/^[\s]*[-*+]\s+/gm, '');

  // Remove numbered list markers (1. 2. etc.)
  plainText = plainText.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquotes (>)
  plainText = plainText.replace(/^>\s*/gm, '');

  // Remove horizontal rules (--- or ***)
  plainText = plainText.replace(/^[-*]{3,}$/gm, '');

  // Clean up extra whitespace and line breaks
  plainText = plainText.replace(/\n{3,}/g, '\n\n');
  plainText = plainText.trim();

  return plainText;
}

/**
 * Copies text to clipboard and shows user feedback
 * @param text - Text to copy
 * @param successMessage - Message to show on success
 */
export async function copyToClipboard(text: string, successMessage: string = 'Copied to clipboard!'): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    // You can replace this with a toast notification system if you have one
    alert(successMessage);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert(successMessage);
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      alert('Failed to copy to clipboard');
    }
    document.body.removeChild(textArea);
  }
}