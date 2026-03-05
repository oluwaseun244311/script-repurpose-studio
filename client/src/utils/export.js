export function scenesToJSON(scenes) {
  return JSON.stringify({ scenes }, null, 2);
}

export function scenesToCSV(scenes) {
  const header = ['Scene', 'Text', 'Image Prompt', 'B-roll Prompt', 'Sound', 'Environment', 'Camera Angle'];
  const rows = scenes.map(s => [
    s.number,
    s.text,
    s.imagePrompt,
    s.brollPrompt,
    s.soundPrompt,
    s.environment,
    s.cameraAngle,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`));
  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadText(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printStoryboard() {
  window.print();
}
