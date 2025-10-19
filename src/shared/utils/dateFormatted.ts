export function dateFormatted(dateInput?: string | number | null): string {
  if (!dateInput) return "N/A";

  const date =
    typeof dateInput === "number"
      ? new Date(dateInput)
      : new Date(Number(dateInput) || dateInput);

  if (isNaN(date.getTime())) return "Invalid date";

  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " ·");
}
