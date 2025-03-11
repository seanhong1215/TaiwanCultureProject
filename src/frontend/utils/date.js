export function formatDate(date, format = "YYYY-MM-DD") {
  const options = {};

  if (format === "YYYY-MM-DD") {
    options.year = "numeric";
    options.month = "2-digit";
    options.day = "2-digit";
  } else if (format === "MM/DD/YYYY") {
    options.month = "2-digit";
    options.day = "2-digit";
    options.year = "numeric";
  } else if (format === "DD-MM-YYYY") {
    options.day = "2-digit";
    options.month = "2-digit";
    options.year = "numeric";
  }

  const formatted = new Intl.DateTimeFormat("en-US", options).format(date);

  if (format === "DD-MM-YYYY") {
    return formatted.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2-$1-$3");
  }
  
  return formatted.replace(/\//g, "-");
}
