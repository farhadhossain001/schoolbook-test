import { Book } from '../types';

const STORAGE_KEY_URL = 'schoolbooks_api_url';
const STORAGE_KEY_PASSWORD = 'schoolbooks_admin_password';
// Default to empty or a specific demo URL if you have one. 
// Using a placeholder here to encourage user configuration.
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxZJNgNMg-45h47dCq35ljrVs3xv10d6b9Sr0uyjRf53kHZXm3VeEX-ARvNlUcAG-Tr/exec';

export const getApiUrl = () => localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_API_URL;
export const setApiUrl = (url: string) => localStorage.setItem(STORAGE_KEY_URL, url);

export const getAdminPassword = () => localStorage.getItem(STORAGE_KEY_PASSWORD) || 'admin123';
export const setAdminPassword = (password: string) => localStorage.setItem(STORAGE_KEY_PASSWORD, password);

export const fetchBooksFromSheet = async (): Promise<Book[]> => {
  const url = getApiUrl();
  if (!url) return [];

  try {
    // Add timestamp to prevent caching
    const fetchUrl = `${url}?t=${new Date().getTime()}`;
    const response = await fetch(fetchUrl);
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    
    if (!Array.isArray(data)) return [];

    // Map and sanitize data to ensure strings
    return data.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(), 
      title: item.title ? String(item.title) : 'Untitled',
      subject: item.subject ? String(item.subject) : 'General',
      classLevel: item.classLevel ? String(item.classLevel) : '1',
      thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : '',
      pdfUrl: item.pdfUrl ? String(item.pdfUrl) : '',
      description: item.description ? String(item.description) : '',
      publishYear: item.publishYear ? String(item.publishYear) : undefined
    }));
  } catch (error) {
    console.error("API Fetch Error:", error);
    return [];
  }
};

// Generic function to send data to GAS
const sendToSheet = async (payload: any): Promise<boolean> => {
  const url = getApiUrl();
  if (!url) throw new Error("API URL not set");

  try {
    // We use no-cors to avoid CORS preflight (OPTIONS) requests which GAS Web App doesn't handle.
    // However, this means the response is opaque (status 0, no body).
    // We must assume success if no network error occurs.
    // The content-type 'text/plain' prevents browser from triggering preflight.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      redirect: 'follow',
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error("API Post Error:", error);
    return false;
  }
};

export const addBookToSheet = async (book: Book): Promise<boolean> => {
  return sendToSheet({ action: 'create', ...book });
};

export const updateBookInSheet = async (book: Book): Promise<boolean> => {
  return sendToSheet({ action: 'update', ...book });
};

export const deleteBookFromSheet = async (id: string): Promise<boolean> => {
  return sendToSheet({ action: 'delete', id });
};