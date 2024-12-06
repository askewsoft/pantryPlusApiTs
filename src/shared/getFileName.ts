const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || '';
};

export default getFileName; 