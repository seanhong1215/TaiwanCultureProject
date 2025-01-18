export function filterResults(data, filter) {
    return data.filter(item => item.category === filter);
  }