/**
 * Converts a base64 encoded string to a Blob URL
 */
export function base64ToBlobUrl(base64Data: string, mimeType = 'audio/wav'): string {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Trigger download of audio file
 */
export function downloadAudio(base64Data: string, filename: string, mimeType = 'audio/wav') {
  const blobUrl = base64ToBlobUrl(base64Data, mimeType);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * Estimates reading time in seconds based on word count and language
 */
export function estimateDurationSeconds(text: string, speed = 1.0): number {
  if (!text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  // Arabic average speaking rate is around 130 words per minute
  const wordsPerMinute = 130 * speed;
  const minutes = words / wordsPerMinute;
  return Math.max(2, Math.round(minutes * 60));
}

/**
 * Formats seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
