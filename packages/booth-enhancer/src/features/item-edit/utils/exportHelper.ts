import JSZip from 'jszip';

// 触发浏览器下载
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export async function downloadZIP(files: Record<string, any>, zipFilename: string): Promise<void> {
  const zip = new JSZip();
  
  for (const [filename, data] of Object.entries(files)) {
    const json = JSON.stringify(data, null, 2);
    zip.file(filename, json);
  }
  
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, zipFilename);
}

export function readJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('无效的 JSON 格式'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export async function readZIPFile(file: File): Promise<Record<string, any>> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const result: Record<string, any> = {};
  
  for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
    if (!zipEntry.dir) {
      const text = await zipEntry.async('text');
      try {
        result[filename] = JSON.parse(text);
      } catch (error) {
        console.warn(`无法解析 ${filename}:`, error);
      }
    }
  }
  
  return result;
}

export function triggerFileInput(accept: string, callback: (file: File) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) callback(file);
  };
  input.click();
}
