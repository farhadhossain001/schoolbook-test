import { Book, Category } from './types';

// Helper to extract Drive ID
export const getDriveId = (url: string): string | null => {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // Standard /file/d/ID
    /id=([a-zA-Z0-9_-]+)/,          // Query param id=ID
    /\/open\?id=([a-zA-Z0-9_-]+)/   // /open?id=ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper to convert various Google Drive links to an embeddable Preview link for iframes
export const getEmbedUrl = (url: string): string => {
  const id = getDriveId(url);
  if (id) {
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return url;
};

// Helper to get the standard download link
export const getGoogleDriveDownloadLink = (url: string): string | null => {
  const id = getDriveId(url);
  if (id) {
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  return null;
};

// Helper to get a CORS-proxied URL for the PDF viewer
// Uses corsproxy.io which handles redirects (like Google Drive's 302) better than other proxies
export const getProxiedPdfUrl = (url: string): string | null => {
  const downloadUrl = getGoogleDriveDownloadLink(url);
  if (!downloadUrl) return null;
  return `https://corsproxy.io/?${encodeURIComponent(downloadUrl)}`;
};

export const CLASSES: Category[] = Array.from({ length: 12 }, (_, i) => ({
  id: `class-${i + 1}`,
  label: `শ্রেণী ${['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '১১', '১২'][i]}`,
  value: (i + 1).toString(),
}));

// Mock Database with Bangla Content
export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'গণিত পার্ট ১',
    subject: 'গণিত',
    classLevel: '10',
    thumbnailUrl: 'https://picsum.photos/300/400?random=1',
    pdfUrl: 'https://drive.google.com/file/d/1XefvptuYY3rRelUfTBB73D5RByvfSBt4/view', 
    description: 'দশম শ্রেণীর শিক্ষার্থীদের জন্য বীজগণিত এবং জ্যামিতির মৌলিক ধারণা।',
  },
  {
    id: '2',
    title: 'পদার্থবিজ্ঞান: গতির সূত্র',
    subject: 'বিজ্ঞান',
    classLevel: '9',
    thumbnailUrl: 'https://picsum.photos/300/400?random=2',
    pdfUrl: 'https://drive.google.com/file/d/115s4TYw-7mzDj2A4Ml755FKH1sScG41R/view',
    description: 'নিউটনের সূত্র এবং মৌলিক বলবিদ্যা বোঝা।',
  },
  {
    id: '3',
    title: 'ইতিহাস: ভারত ও সমসাময়িক বিশ্ব',
    subject: 'সামাজিক বিজ্ঞান',
    classLevel: '10',
    thumbnailUrl: 'https://picsum.photos/300/400?random=3',
    pdfUrl: 'https://drive.google.com/open?id=test_id_3',
    description: 'শিল্প বিপ্লব এবং ভারতের জাতীয়তাবাদের গভীর আলোচনা।',
  },
  {
    id: '4',
    title: 'ইংলিশ বিহাইভ',
    subject: 'ইংরেজি',
    classLevel: '9',
    thumbnailUrl: 'https://picsum.photos/300/400?random=4',
    pdfUrl: 'https://drive.google.com/file/d/test_id_4/preview',
    description: 'ইংরেজি সাহিত্যের পাঠ্যপুস্তক।',
  },
  {
    id: '5',
    title: 'রসায়ন: আমাদের চারপাশের পদার্থ',
    subject: 'বিজ্ঞান',
    classLevel: '9',
    thumbnailUrl: 'https://picsum.photos/300/400?random=5',
    pdfUrl: 'https://drive.google.com/file/d/test_id_5/preview',
  },
  {
    id: '6',
    title: 'জীববিজ্ঞান: জীবন প্রক্রিয়া',
    subject: 'বিজ্ঞান',
    classLevel: '10',
    thumbnailUrl: 'https://picsum.photos/300/400?random=6',
    pdfUrl: 'https://drive.google.com/file/d/test_id_6/preview',
  },
  {
    id: '7',
    title: 'পৌরনীতি: গণতান্ত্রিক রাজনীতি',
    subject: 'সামাজিক বিজ্ঞান',
    classLevel: '9',
    thumbnailUrl: 'https://picsum.photos/300/400?random=7',
    pdfUrl: 'https://drive.google.com/file/d/test_id_7/preview',
  },
  {
    id: '8',
    title: 'প্রাথমিক ব্যষ্টিক অর্থনীতি',
    subject: 'অর্থনীতি',
    classLevel: '11',
    thumbnailUrl: 'https://picsum.photos/300/400?random=8',
    pdfUrl: 'https://drive.google.com/file/d/test_id_8/preview',
  },
  {
    id: '9',
    title: 'ব্যবসায় শিক্ষা পার্ট ১',
    subject: 'ব্যবসায়',
    classLevel: '12',
    thumbnailUrl: 'https://picsum.photos/300/400?random=9',
    pdfUrl: 'https://drive.google.com/file/d/test_id_9/preview',
  },
  {
    id: '10',
    title: 'গণিত মজা',
    subject: 'গণিত',
    classLevel: '1',
    thumbnailUrl: 'https://picsum.photos/300/400?random=10',
    pdfUrl: 'https://drive.google.com/file/d/test_id_10/preview',
  },
];