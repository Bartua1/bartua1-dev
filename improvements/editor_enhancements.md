# ✍️ Advanced Editor & Authoring Enhancements

This document outlines implementation details for enhancing the admin authoring experience, transforming the text editor into an interactive workspace.

---

## 💾 1. Auto-save & Local Draft Recovery

To prevent losing written posts during network disconnects or browser crashes, we can implement client-side auto-save keyed by the post's ID and active locale.

### Proposed Implementation
Add a `useEffect` inside `PostEditorForm` to back up content changes:

```tsx
// Key based on post id and locale
const storageKey = `draft_${post.id}_${locale}`;

// 1. Restore on mount
useEffect(() => {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const { savedTitle, savedContent } = JSON.parse(saved);
      if (savedContent !== content || savedTitle !== title) {
        const confirmRestore = window.confirm(
          locale === 'es' 
            ? '¿Deseas restaurar la copia de seguridad local no guardada?' 
            : 'Do you want to restore the unsaved local backup?'
        );
        if (confirmRestore) {
          setTitle(savedTitle);
          setContent(savedContent);
        }
      }
    } catch (e) {
      console.error('Failed to parse draft backup', e);
    }
  }
}, []);

// 2. Auto-save when content changes
useEffect(() => {
  const debounce = setTimeout(() => {
    localStorage.setItem(storageKey, JSON.stringify({ savedTitle: title, savedContent: content }));
  }, 1000); // Save after 1s of typing inactivity
  
  return () => clearTimeout(debounce);
}, [title, content]);

// 3. Clear backup on successful save
// inside handleFormSubmit, after success:
localStorage.removeItem(storageKey);
```

---

## 🛠️ 2. Clickable Markdown Formatting Toolbar

Instead of static help tooltips, we can make the formatting labels actual buttons that insert syntax at the current cursor selection in the `<textarea>`.

### Text Selection Helper Function
```ts
const insertMarkdown = (syntaxBefore: string, syntaxAfter: string = '') => {
  const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  
  const selectedText = text.substring(start, end);
  const replacement = syntaxBefore + (selectedText || 'text') + syntaxAfter;
  
  const newValue = text.substring(0, start) + replacement + text.substring(end);
  setContent(newValue);

  // Reset focus & selection
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + syntaxBefore.length,
      start + syntaxBefore.length + (selectedText || 'text').length
    );
  }, 0);
};
```

### Toolbar UI Buttons
Replace the help text bar with interactive buttons:
- **Bold**: `onClick={() => insertMarkdown('**', '**')}`
- **Italic**: `onClick={() => insertMarkdown('*', '*')}`
- **H2**: `onClick={() => insertMarkdown('## ')}`
- **H3**: `onClick={() => insertMarkdown('### ')}`
- **Link**: `onClick={() => insertMarkdown('[', '](url)')}`
- **Code Block**: `onClick={() => insertMarkdown('```\n', '\n```')}`
- **Quote**: `onClick={() => insertMarkdown('> ')}`

---

## 📤 3. Image Drag-and-Drop & Paste Uploads

Allowing images to be dropped or pasted directly into the editor. This requires a backend upload endpoint and client-side listeners on the `textarea`.

### Step 1: Upload API Route (`src/app/api/admin/upload/route.ts`)
Create a Next.js App Router API route to write files to the public assets directory:

```ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Verify admin IP before allowing upload
async function isAdminAuthorized(request: Request): Promise<boolean> {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  
  // Query db to check if IP is whitelisted (AdminIp table)
  // ...
  return true; // Simplified for design
}

export async function POST(req: Request) {
  if (!await isAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique name
    const ext = path.extname(file.name) || '.png';
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${hash}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads');
    
    // Ensure dir exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Return the relative URL prefixing with /dev/assets as per basePath rules
    return NextResponse.json({ url: `/dev/assets/uploads/${filename}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

### Step 2: Editor Handlers for File Input
```tsx
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/dev/api/admin/upload', {
    method: 'POST',
    body: formData
  });
  
  const data = await res.json();
  if (data.url) {
    insertMarkdown(`![${file.name}](${data.url})`);
  } else {
    alert('Upload failed: ' + data.error);
  }
};

const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  const file = e.clipboardData.files[0];
  if (file && file.type.startsWith('image/')) {
    e.preventDefault();
    uploadFile(file);
  }
};

const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    e.preventDefault();
    uploadFile(file);
  }
};
```
Add `onPaste={handlePaste}` and `onDrop={handleDrop}` to the `<textarea>`.

---

## 🤖 4. AI-Assisted Translation Helper

Since the blog is fully bilingual, writing translations manually is time-consuming. We can add a "Translate via AI" button that calls the Gemini API to automatically translate the content of the active language to the other.

### API Integration
Create an endpoint `/api/admin/translate` that receives markdown text and target language, requests the translation from Gemini using the system prompt:
> "You are an expert bilingual technical translator. Translate the following markdown from [Source Lang] to [Target Lang]. Preserve all markdown syntax, code block formatting, and links exactly. Return only the translated text."

In the Editor UI:
- Add a button **"🤖 Auto-Translate to ES/EN"**.
- Fetches the translation and updates the corresponding fields (`contentEs` or `contentEn`).
