(() => {
  const table = document.getElementById('teran-resource-table');
  if (!table) return;
  const search = document.getElementById('teran-resource-search');
  const type = document.getElementById('teran-resource-type');
  const count = document.getElementById('teran-resource-count');
  const empty = document.getElementById('teran-resource-empty');
  const rows = Array.from(table.tBodies[0].rows);
  const filter = () => {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const row of rows) {
      const matches = (!type.value || row.dataset.resourceType === type.value) &&
        terms.every(term => row.dataset.resourceSearch.includes(term));
      row.hidden = !matches;
      if (matches) visible += 1;
    }
    count.textContent = `${visible} of ${rows.length} resources`;
    empty.hidden = visible !== 0;
  };
  search.addEventListener('input', filter);
  type.addEventListener('change', filter);
})();
