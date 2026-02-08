function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function startOfWeek() {
  const now = new Date();
  const d = new Date();
  d.setDate(now.getDate() - 6); // 7 days including today
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}


module.exports = {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth
};
