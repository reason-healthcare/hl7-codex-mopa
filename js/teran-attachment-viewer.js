(() => {
  const viewer = document.getElementById('teran-attachment-viewer');
  if (!viewer) return;
  const sections = Array.from(viewer.querySelectorAll('section[data-note-id]'));
  const missing = document.getElementById('teran-attachment-missing');
  const showNote = () => {
    const selectedId = location.hash.startsWith('#note-') ? location.hash.slice(1) : '';
    const selected = sections.find(section => section.dataset.noteId === selectedId);
    for (const section of sections) section.hidden = !!selectedId && section !== selected;
    missing.hidden = !selectedId || !!selected;
  };
  window.addEventListener('hashchange', showNote);
  showNote();
})();
