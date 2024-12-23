const getFileName = (filePath: string): string => {
  const parts = filePath.split('/');
  const fileName = parts.pop() || '';
  const parentDir = parts.pop() || '';
  const domain = parts.pop() || '';
  return `${domain}/${fileName}`;
};

export default getFileName; 
