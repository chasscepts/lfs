const fileSize = (bytes) => {
  if (bytes < 1000) return `${bytes}B`;
  if (bytes < 1000000) return `${Math.floor(bytes / 1000)}KB`;
  if (bytes < 1000000000) return `${Math.floor(bytes / 1000000)}MB`;
  if (bytes < 1000000000000) return `${Math.floor(bytes / 1000000000)}GB`;
  if (bytes < 1000000000000000) return `${Math.floor(bytes / 1000000000000)}TB`;
  return `${bytes}`;
}

export default {
  fileSize,
};
