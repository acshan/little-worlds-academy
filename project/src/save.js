const key = "forest-keeper-record-v1";
export function loadRecord() {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (
      value?.version === 1 &&
      Number.isFinite(value.best) &&
      Number.isFinite(value.runs) &&
      value.best >= 0 &&
      value.runs >= 0
    )
      return value;
  } catch {}
  return { version: 1, best: 0, runs: 0 };
}
export function saveRecord(record) {
  try {
    localStorage.setItem(key, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}
