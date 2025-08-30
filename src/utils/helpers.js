export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const COLORS = {
  income: "#3bc082ff",
  expense: "#e26f6fff",
};

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const PAGINATION_VALUES = [10, 20, 50, 70, 100];

const date = new Date();
const year = date.getFullYear();
export const yearOptions = Array.from({ length: 5 }, (_, i) => year - i);

export const maskValue = (value) => {
  if (value == null) return "-";
  const str = value.toString();
  return "*".repeat(str.length);
};
