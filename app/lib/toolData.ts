export type ToolId =
  | "split"
  | "merge"
  | "compress"
  | "rotate"
  | "delete"
  | "extract"
  | "watermark"
  | "number"
  | "crop"
  | "redact"
  | "sign"
  | "imagetopdf"
  | "pdftoimage"
  | "pdftodocx"
  | "docxtopdf"
  | "pdftoexcel"
  | "exceltopdf"
  | "pdftopptx"
  | "pptxtopdf"
  | "edittext";

export interface ToolPageData {
  slug: string;
  toolId: ToolId;
  label: string;
  shortDesc: string;
  color: string;
  category: "popular" | "organize" | "edit" | "sign" | "convert";
  seoTitle: string;
  seoDescription: string;
  h1: string;
  keywords: string;
  introText: string;
  howToSteps: string[];
  whyUseContent: string;
  privacyBlurb: string;
  faqs: Array<{ question: string; answer: string }>;
  relatedTools: string[];
}

/* ── Tool page data for all 19 tools ─────────────────── */

export const TOOLS: Record<string, ToolPageData> = {
  /* ─── Popular ──────────────────────────────────────── */

  "split-pdf": {
    slug: "split-pdf",
    toolId: "split",
    label: "Split PDF",
    shortDesc: "Extract specific pages or ranges",
    color: "#a78bfa",
    category: "popular",
    seoTitle: "Split PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Split PDF files into separate pages or custom ranges directly in your browser. Free, private, and no upload needed — your files never leave your device.",
    h1: "Split PDF Online — Free PDF Splitter",
    keywords:
      "split pdf, pdf splitter, separate pdf pages, divide pdf, extract pdf pages online, free pdf split tool",
    introText:
      "Need to break a large PDF into smaller files? Our free PDF splitter lets you separate a document into individual pages or custom page ranges entirely within your browser. Whether you need to pull out a single chapter, isolate specific pages for sharing, or divide a report into sections, this tool handles it in seconds.\n\nBecause all processing happens locally on your device, your files are never uploaded to any server. There is nothing to install and no account to create. Just open the tool, pick your pages, and download the result.",
    howToSteps: [
      "Open your PDF file using the file picker or drag and drop.",
      "Select the pages or page ranges you want to extract.",
      "Click Split and download the resulting PDF files.",
    ],
    whyUseContent:
      "This PDF splitter is completely free, requires no software installation, and works on any device with a modern browser. Because it runs entirely client-side, your documents stay private — nothing is uploaded or stored on a remote server. It is fast, reliable, and available whenever you need it.",
    privacyBlurb:
      "Your files are processed entirely in your browser using client-side JavaScript. No data is sent to any server, no files are stored remotely, and no one else can access your documents. Once you close the tab, the processed data is gone.",
    faqs: [
      {
        question: "How do I split a PDF into individual pages?",
        answer:
          "Upload your PDF, then select each page you want as a separate file. Click Split and each page will be extracted into its own PDF that you can download individually.",
      },
      {
        question: "Can I split a PDF by page ranges?",
        answer:
          "Yes. After uploading, you can specify custom ranges such as pages 1-3, 5, and 8-12. Each range becomes a separate downloadable PDF.",
      },
      {
        question: "Is it safe to split PDFs online?",
        answer:
          "Absolutely. This tool processes your file entirely in your browser. Your PDF is never uploaded to a server, so there is no risk of interception or unauthorized access.",
      },
      {
        question: "Do I need to install any software?",
        answer:
          "No. The splitter runs directly in your web browser. There is nothing to download or install, and it works on Windows, Mac, Linux, and mobile devices.",
      },
    ],
    relatedTools: ["merge-pdf", "extract-pdf-pages", "delete-pdf-pages"],
  },

  "merge-pdf": {
    slug: "merge-pdf",
    toolId: "merge",
    label: "Merge PDFs",
    shortDesc: "Combine multiple PDFs into one",
    color: "#6d9eeb",
    category: "popular",
    seoTitle: "Merge PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Combine multiple PDF files into a single document in your browser. Free, browser-based, and completely private — your files never leave your device.",
    h1: "Merge PDFs Online — Free PDF Combiner",
    keywords:
      "merge pdf, combine pdf, join pdf files, pdf merger, merge pdf online free, combine pdf without acrobat",
    introText:
      "Combining multiple PDF files into one document is a common task for reports, portfolios, applications, and more. Our free PDF merger lets you drag and drop several files, reorder them however you like, and produce a single combined PDF — all without leaving your browser.\n\nThere is no file-size limit enforced by a server because the merging happens entirely on your device. Your documents stay private and the process is fast, even for large files. No account required, no watermarks added.",
    howToSteps: [
      "Select or drag and drop the PDF files you want to merge.",
      "Reorder the files by dragging them into the desired sequence.",
      "Click Merge and download your combined PDF.",
    ],
    whyUseContent:
      "Merging PDFs should not require expensive software or uploading sensitive documents to a third party. This tool is free, runs in any modern browser, and keeps your files completely private. It works on desktops, tablets, and phones with no installation necessary.",
    privacyBlurb:
      "Every step of the merge process runs locally in your browser. Your PDF files are never transmitted to any server. No data is stored, logged, or accessible to anyone else. When you close the page, all temporary data is released from memory.",
    faqs: [
      {
        question: "How do I merge PDFs without Adobe Acrobat?",
        answer:
          "Simply use this free browser-based tool. Upload your files, arrange them in order, and click Merge. No Acrobat subscription or desktop software is needed.",
      },
      {
        question: "Is there a limit to how many PDFs I can merge?",
        answer:
          "There is no hard limit. Since processing happens in your browser, the practical limit depends on your device's available memory. Most users can merge dozens of files without any issue.",
      },
      {
        question: "Will merging reduce the quality of my PDFs?",
        answer:
          "No. The tool combines the original PDF data without re-encoding or compressing it, so the output quality is identical to the source files.",
      },
      {
        question: "Can I reorder pages before merging?",
        answer:
          "Yes. After uploading, you can drag files into any order before combining them. If you need to reorder individual pages, use the Split or Extract tool first.",
      },
    ],
    relatedTools: ["split-pdf", "compress-pdf", "rotate-pdf"],
  },

  "compress-pdf": {
    slug: "compress-pdf",
    toolId: "compress",
    label: "Compress PDF",
    shortDesc: "Reduce file size",
    color: "#6ee7b7",
    category: "popular",
    seoTitle: "Compress PDF Online for Free — No Upload | PDF Tools",
    seoDescription:
      "Reduce PDF file size directly in your browser. Free, browser-based PDF compression with no upload — your documents never leave your device.",
    h1: "Compress PDF Online — Free PDF Compressor",
    keywords:
      "compress pdf, reduce pdf size, pdf compressor, shrink pdf, make pdf smaller, compress pdf online free",
    introText:
      "Large PDF files can be a problem when emailing documents, uploading to portals, or simply trying to save storage space. Our free PDF compressor reduces file size by optimizing internal structures and embedded resources while preserving readability.\n\nThe entire compression process runs in your browser. Your file is never uploaded to a server, which means it stays private and the result is available instantly. No signup, no watermarks, and no limits on how many files you can compress.",
    howToSteps: [
      "Upload the PDF file you want to compress.",
      "Wait a moment while the tool optimizes the file in your browser.",
      "Download the compressed PDF and compare the file size.",
    ],
    whyUseContent:
      "This compressor is free, fast, and respects your privacy. Because it runs client-side, there is no upload wait time and no risk of your data being intercepted. It works on any device with a browser — desktop, tablet, or phone — with zero installation.",
    privacyBlurb:
      "All compression is performed locally using JavaScript in your browser. Your PDF never leaves your device, is never stored on a server, and is never accessible to anyone but you. Close the tab and all data is gone.",
    faqs: [
      {
        question: "Is it safe to compress PDFs online?",
        answer:
          "Yes. This tool processes your file entirely in your browser. Nothing is uploaded, so there is no risk of data exposure or server-side storage.",
      },
      {
        question: "How much can I reduce the file size?",
        answer:
          "Results vary depending on the PDF content. Files with large embedded images or redundant metadata typically see the biggest reductions. Text-heavy documents may see modest savings.",
      },
      {
        question: "Will compression affect the quality of my PDF?",
        answer:
          "The tool optimizes internal structures and may reduce image resolution slightly to achieve smaller sizes, but the document remains fully readable and printable.",
      },
    ],
    relatedTools: ["merge-pdf", "split-pdf", "pdf-to-image"],
  },

  /* ─── Organize ─────────────────────────────────────── */

  "rotate-pdf": {
    slug: "rotate-pdf",
    toolId: "rotate",
    label: "Rotate Pages",
    shortDesc: "Rotate all or specific pages",
    color: "#fbbf24",
    category: "organize",
    seoTitle: "Rotate PDF Pages Online for Free — No Upload | PDF Tools",
    seoDescription:
      "Rotate PDF pages 90, 180, or 270 degrees in your browser. Free, private, and no upload needed — files are processed entirely on your device.",
    h1: "Rotate PDF Pages Online — Free PDF Rotation Tool",
    keywords:
      "rotate pdf, rotate pdf pages, flip pdf, turn pdf sideways, rotate pdf online free",
    introText:
      "Scanned documents and exported files sometimes end up with pages in the wrong orientation. Our free PDF rotation tool lets you fix that by rotating individual pages or the entire document by 90, 180, or 270 degrees — all within your browser.\n\nNo software to install, no files to upload. Select the pages that need rotating, choose the direction, and download the corrected PDF. It works on any device and your documents stay completely private.",
    howToSteps: [
      "Upload the PDF with incorrectly oriented pages.",
      "Select the pages you want to rotate and choose the rotation angle.",
      "Click Rotate and download the corrected PDF.",
    ],
    whyUseContent:
      "Fixing page orientation should be quick and free. This browser-based tool requires no installation, handles any PDF, and processes everything locally so your files remain private. Use it on any device — desktop, tablet, or phone.",
    privacyBlurb:
      "Rotation is performed entirely in your browser. Your PDF is never uploaded to any external server, and no data is retained after you close the page. Your documents remain yours alone.",
    faqs: [
      {
        question: "Can I rotate just one page in a PDF?",
        answer:
          "Yes. After uploading, you can select individual pages and rotate them independently while leaving the rest unchanged.",
      },
      {
        question: "What rotation angles are supported?",
        answer:
          "You can rotate pages by 90 degrees clockwise, 90 degrees counter-clockwise, or 180 degrees.",
      },
      {
        question: "Does rotating affect the content quality?",
        answer:
          "No. Rotation changes the page orientation metadata without re-encoding the content, so quality is preserved exactly.",
      },
    ],
    relatedTools: ["split-pdf", "delete-pdf-pages", "crop-pdf"],
  },

  "delete-pdf-pages": {
    slug: "delete-pdf-pages",
    toolId: "delete",
    label: "Delete Pages",
    shortDesc: "Remove unwanted pages",
    color: "#f87171",
    category: "organize",
    seoTitle:
      "Delete PDF Pages Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Remove unwanted pages from any PDF directly in your browser. Free, browser-based, and private — your files never leave your device.",
    h1: "Delete PDF Pages Online — Free Page Remover",
    keywords:
      "delete pdf pages, remove pdf pages, pdf page remover, delete pages from pdf online free",
    introText:
      "Sometimes a PDF contains pages you do not need — blank pages, cover sheets, or irrelevant sections. Our free page deletion tool lets you remove any pages from a PDF without installing software or uploading your file anywhere.\n\nJust open the document, select the pages to remove, and download the cleaned-up PDF. The entire process is handled by your browser, so your documents stay private and the result is instant.",
    howToSteps: [
      "Upload the PDF file containing pages you want to remove.",
      "Select the pages you want to delete from the preview.",
      "Click Delete and download the updated PDF.",
    ],
    whyUseContent:
      "Removing pages from a PDF should not require Acrobat or any paid software. This tool is free, works in any browser, and processes your file locally. No sign-up, no watermarks, and no file size limits imposed by a server.",
    privacyBlurb:
      "Your document is processed entirely in your browser. No pages or data are sent to any server. Nothing is logged or stored. Your file stays on your device from start to finish.",
    faqs: [
      {
        question: "Can I delete multiple pages at once?",
        answer:
          "Yes. You can select as many pages as you want to remove before clicking Delete. The remaining pages are saved into a new PDF.",
      },
      {
        question: "Will deleting pages affect the remaining content?",
        answer:
          "No. Only the selected pages are removed. All other pages, bookmarks, and formatting are preserved in the output file.",
      },
      {
        question: "Can I undo a page deletion?",
        answer:
          "The tool creates a new PDF without the deleted pages. Your original file is not modified, so you always have the original as a backup.",
      },
    ],
    relatedTools: ["extract-pdf-pages", "split-pdf", "rotate-pdf"],
  },

  "extract-pdf-pages": {
    slug: "extract-pdf-pages",
    toolId: "extract",
    label: "Extract Pages",
    shortDesc: "Pick pages into a new PDF",
    color: "#c4b5fd",
    category: "organize",
    seoTitle:
      "Extract PDF Pages Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Extract specific pages from a PDF into a new file in your browser. Free, private, and no upload required — files never leave your device.",
    h1: "Extract PDF Pages Online — Free Page Extractor",
    keywords:
      "extract pdf pages, pull pages from pdf, save specific pdf pages, pdf page extractor online free",
    introText:
      "When you only need certain pages from a large PDF, extracting them into a new file is the cleanest solution. Our free extraction tool lets you pick exactly the pages you want and save them as a separate PDF — all within your browser.\n\nThis is ideal for pulling out a specific chapter, a set of forms, or key pages from a lengthy report. No upload required, no account needed, and your documents remain completely private throughout the process.",
    howToSteps: [
      "Upload the PDF file you want to extract pages from.",
      "Select the specific pages or page ranges to extract.",
      "Click Extract and download the new PDF containing only your selected pages.",
    ],
    whyUseContent:
      "Extracting pages should be simple and free. This tool works instantly in your browser on any device, requires no software, and ensures your documents stay private since nothing is uploaded to a server.",
    privacyBlurb:
      "Page extraction is performed entirely in your browser using client-side processing. Your PDF is never sent to any server, and no data is retained once you close the tab. Complete privacy is guaranteed.",
    faqs: [
      {
        question: "What is the difference between splitting and extracting?",
        answer:
          "Splitting divides a PDF into multiple files (e.g., one per page), while extracting pulls selected pages into a single new PDF. Use Extract when you want specific pages combined in one file.",
      },
      {
        question: "Can I extract non-consecutive pages?",
        answer:
          "Yes. You can select any combination of pages — for example, pages 1, 3, 7-10, and 15 — and they will be combined into a single output PDF in the order you selected.",
      },
      {
        question: "Does extraction modify my original file?",
        answer:
          "No. The tool creates a brand-new PDF from the selected pages. Your original file remains completely unchanged.",
      },
    ],
    relatedTools: ["split-pdf", "delete-pdf-pages", "merge-pdf"],
  },

  /* ─── Edit ─────────────────────────────────────────── */

  "add-watermark-to-pdf": {
    slug: "add-watermark-to-pdf",
    toolId: "watermark",
    label: "Watermark",
    shortDesc: "Add text watermark",
    color: "#67e8f9",
    category: "edit",
    seoTitle:
      "Add Watermark to PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Add text watermarks to your PDF files in the browser. Free, private, and no upload needed — your documents never leave your device.",
    h1: "Add Watermark to PDF Online — Free PDF Watermark Tool",
    keywords:
      "add watermark to pdf, pdf watermark, stamp pdf, watermark pdf online free, text watermark pdf",
    introText:
      "Adding a watermark to a PDF is essential for marking documents as drafts, confidential, or proprietary. Our free watermark tool lets you overlay custom text on every page of your PDF with control over font size, color, opacity, and position — all in your browser.\n\nWhether you are protecting intellectual property, labeling document status, or branding pages before distribution, this tool handles it without uploading your file to any server. The result is immediate and your documents remain private.",
    howToSteps: [
      "Upload the PDF file you want to watermark.",
      "Enter your watermark text and customize the appearance (size, color, opacity, position).",
      "Preview the result on your pages.",
      "Click Apply and download the watermarked PDF.",
    ],
    whyUseContent:
      "Adding watermarks should not require expensive PDF editing software. This free tool runs directly in your browser, works on any device, and keeps your files private since nothing leaves your machine. Customize the text exactly how you need it and download instantly.",
    privacyBlurb:
      "Watermarking happens entirely on your device using browser-based processing. Your PDF is never uploaded, stored, or shared with any external service. Close the tab and all data is erased from memory.",
    faqs: [
      {
        question: "Can I customize the watermark text and appearance?",
        answer:
          "Yes. You can set the text content, font size, color, opacity, rotation angle, and position on the page to get exactly the look you want.",
      },
      {
        question: "Is the watermark applied to every page?",
        answer:
          "By default, the watermark is applied to all pages. The tool overlays your text on each page of the PDF.",
      },
      {
        question: "Can the watermark be removed later?",
        answer:
          "The watermark is embedded into the PDF content. While it could be removed with advanced PDF editing tools, it serves as a visible deterrent and clear marking for recipients.",
      },
    ],
    relatedTools: ["sign-pdf", "add-page-numbers-to-pdf", "compress-pdf"],
  },

  "add-page-numbers-to-pdf": {
    slug: "add-page-numbers-to-pdf",
    toolId: "number",
    label: "Number Pages",
    shortDesc: "Add page numbers",
    color: "#a78bfa",
    category: "edit",
    seoTitle:
      "Add Page Numbers to PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Add page numbers to your PDF documents in the browser. Free, private, and no upload needed — files are processed entirely on your device.",
    h1: "Add Page Numbers to PDF Online — Free PDF Numbering Tool",
    keywords:
      "add page numbers to pdf, number pdf pages, pdf page numbering, insert page numbers pdf online free",
    introText:
      "Documents without page numbers can be difficult to navigate, reference, and print. Our free tool adds page numbers to every page of your PDF with options for position, format, and starting number — all handled in your browser.\n\nThis is particularly useful for manuscripts, reports, legal documents, and any multi-page PDF that needs clear pagination. No software to install, no files to upload, and the result is ready in seconds.",
    howToSteps: [
      "Upload the PDF you want to add page numbers to.",
      "Choose the position (top or bottom, left, center, or right) and starting number.",
      "Click Apply and download the numbered PDF.",
    ],
    whyUseContent:
      "Adding page numbers should be a quick, free task. This browser-based tool works on any device, processes your file locally for complete privacy, and requires no account or installation. Get professional pagination in seconds.",
    privacyBlurb:
      "All numbering is done in your browser. Your PDF is not uploaded to any server, no data is collected, and nothing is stored. Your document remains entirely on your device throughout the process.",
    faqs: [
      {
        question: "Can I choose where the page numbers appear?",
        answer:
          "Yes. You can place numbers at the top or bottom of the page, aligned to the left, center, or right.",
      },
      {
        question: "Can I start numbering from a specific page?",
        answer:
          "Yes. You can set a custom starting number, which is useful if your PDF is part of a larger document.",
      },
      {
        question: "Does this work with scanned PDFs?",
        answer:
          "Yes. Page numbers are overlaid on top of each page regardless of whether the PDF contains text, images, or scanned content.",
      },
    ],
    relatedTools: ["add-watermark-to-pdf", "compress-pdf", "merge-pdf"],
  },

  "crop-pdf": {
    slug: "crop-pdf",
    toolId: "crop",
    label: "Crop PDF",
    shortDesc: "Trim margins",
    color: "#5eead4",
    category: "edit",
    seoTitle: "Crop PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Crop and trim PDF page margins directly in your browser. Free, browser-based, and private — your files never leave your device.",
    h1: "Crop PDF Online — Free PDF Cropping Tool",
    keywords:
      "crop pdf, trim pdf margins, resize pdf pages, cut pdf borders, crop pdf online free",
    introText:
      "PDF files often have excessive margins, headers, or footers that waste space when printing or viewing. Our free cropping tool lets you trim the visible area of each page by adjusting the crop box — all within your browser.\n\nThis is especially useful for research papers with wide margins, scanned documents with uneven borders, or any PDF where you want to focus on the actual content area. No upload, no installation, and instant results.",
    howToSteps: [
      "Upload the PDF file you want to crop.",
      "Adjust the crop area by setting margins or dragging the crop box.",
      "Preview the cropped result.",
      "Click Crop and download the trimmed PDF.",
    ],
    whyUseContent:
      "Cropping PDFs should not require a full editing suite. This free, browser-based tool handles margin trimming instantly on any device. Your files are processed locally, ensuring total privacy with no uploads or server-side storage.",
    privacyBlurb:
      "Cropping is performed entirely in your browser. No file data is sent to any server. Nothing is logged, stored, or shared. Your document stays private on your device the entire time.",
    faqs: [
      {
        question: "Does cropping reduce the file size?",
        answer:
          "Cropping changes the visible area of pages but does not necessarily remove the underlying data, so file size may not change significantly. Use the Compress tool for size reduction.",
      },
      {
        question: "Can I crop different pages to different sizes?",
        answer:
          "The tool applies the same crop dimensions to all pages. For per-page adjustments, you can extract individual pages and crop them separately.",
      },
      {
        question: "Is the original content preserved after cropping?",
        answer:
          "Yes. Cropping adjusts the crop box metadata. The original page content still exists in the file, meaning some PDF viewers can restore the full page if needed.",
      },
    ],
    relatedTools: ["rotate-pdf", "compress-pdf", "delete-pdf-pages"],
  },

  "redact-pdf": {
    slug: "redact-pdf",
    toolId: "redact",
    label: "Redact",
    shortDesc: "Black out sensitive areas",
    color: "#94a3b8",
    category: "edit",
    seoTitle: "Redact PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Black out sensitive information in PDF files directly in your browser. Free, private, and no upload required — files never leave your device.",
    h1: "Redact PDF Online — Free PDF Redaction Tool",
    keywords:
      "redact pdf, black out pdf text, censor pdf, hide sensitive information pdf, pdf redaction tool online free",
    introText:
      "Sharing documents often requires hiding sensitive information such as names, addresses, financial data, or personal identifiers. Our free PDF redaction tool lets you draw black boxes over any area of any page to permanently cover content before sharing.\n\nUnlike simply highlighting in black, proper redaction ensures the underlying text is not recoverable. Process everything in your browser so sensitive documents are never uploaded to any server — an essential requirement when dealing with private or confidential information.",
    howToSteps: [
      "Upload the PDF containing sensitive information.",
      "Draw redaction boxes over the areas you want to black out.",
      "Preview the redacted pages to confirm coverage.",
      "Click Apply and download the redacted PDF.",
    ],
    whyUseContent:
      "Redacting sensitive information is critical for compliance and privacy. This tool is free, runs entirely in your browser, and guarantees that your confidential documents are never uploaded or exposed to any third party. Works on any device with no installation.",
    privacyBlurb:
      "Redaction is handled 100% in your browser. Your sensitive PDF is never uploaded to any server, making this the safest way to redact documents online. No data is stored, transmitted, or logged at any point.",
    faqs: [
      {
        question: "Is the redacted text truly removed?",
        answer:
          "Yes. The tool draws opaque black rectangles over selected areas and flattens the result, so the underlying text is not accessible in the output file.",
      },
      {
        question: "Can I redact multiple areas on the same page?",
        answer:
          "Yes. You can draw as many redaction boxes as needed on any page before applying the changes.",
      },
      {
        question: "Is browser-based redaction safe for confidential documents?",
        answer:
          "Yes. Because the file is processed entirely on your device and never leaves your browser, it is actually safer than cloud-based redaction services that require uploading your document.",
      },
    ],
    relatedTools: ["sign-pdf", "add-watermark-to-pdf", "compress-pdf"],
  },

  /* ─── Sign ─────────────────────────────────────────── */

  "sign-pdf": {
    slug: "sign-pdf",
    toolId: "sign",
    label: "Sign PDF",
    shortDesc: "Draw and embed your signature",
    color: "#f0abfc",
    category: "sign",
    seoTitle: "Sign PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Add your signature to PDF documents directly in your browser. Free, browser-based, and completely private — files never leave your device.",
    h1: "Sign PDF Online — Free PDF Signature Tool",
    keywords:
      "sign pdf, add signature to pdf, pdf signature, e-sign pdf, sign pdf online free, draw signature on pdf",
    introText:
      "Signing PDF documents digitally saves time and eliminates the need to print, sign by hand, and scan. Our free PDF signing tool lets you draw or type your signature and place it precisely on any page of your document — all within your browser.\n\nThis is perfect for contracts, agreements, forms, and any document that needs your signature. The tool is free to use, requires no account, and processes everything locally so your documents and signature remain private.",
    howToSteps: [
      "Upload the PDF document you need to sign.",
      "Draw your signature using your mouse or touchscreen, or type your name to generate one.",
      "Position and resize the signature on the desired page.",
      "Click Apply and download the signed PDF.",
    ],
    whyUseContent:
      "Signing PDFs should be free and private. This tool runs entirely in your browser with no server uploads, meaning your documents and personal signature are never exposed to third parties. Works on any device — use your finger on a phone or a mouse on a desktop.",
    privacyBlurb:
      "Your document and signature are processed entirely in your browser. Nothing is uploaded to any server, no signature data is stored, and no one else has access to your files. This is the most private way to sign a PDF online.",
    faqs: [
      {
        question: "Is an electronic signature legally valid?",
        answer:
          "In many jurisdictions, electronic signatures are legally recognized for most documents. However, some documents may require certified digital signatures or notarization. Check your local regulations for specific requirements.",
      },
      {
        question: "Can I sign multiple pages?",
        answer:
          "Yes. You can place your signature on any page and add multiple signatures to different locations throughout the document.",
      },
      {
        question: "Is my signature stored anywhere?",
        answer:
          "No. Your signature exists only in your browser session. It is not uploaded, stored, or saved anywhere. Once you close the tab, the signature data is gone.",
      },
      {
        question: "Can I use this on a touchscreen device?",
        answer:
          "Yes. The signature pad works with touch input, so you can draw your signature with your finger on a tablet or smartphone.",
      },
    ],
    relatedTools: ["redact-pdf", "add-watermark-to-pdf", "compress-pdf"],
  },

  /* ─── Convert ──────────────────────────────────────── */

  "image-to-pdf": {
    slug: "image-to-pdf",
    toolId: "imagetopdf",
    label: "Image to PDF",
    shortDesc: "Combine images into PDF",
    color: "#fb923c",
    category: "convert",
    seoTitle:
      "Convert Images to PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert JPG, PNG, and other images to PDF directly in your browser. Free, private, and no upload needed — files are processed on your device.",
    h1: "Convert Images to PDF Online — Free Image to PDF Converter",
    keywords:
      "image to pdf, jpg to pdf, png to pdf, convert image to pdf, photo to pdf, image to pdf online free",
    introText:
      "Converting images to PDF is useful for creating photo albums, digitizing receipts, assembling scanned documents, or simply sharing images in a universally readable format. Our free tool converts JPG, PNG, and other common image formats into a clean PDF document.\n\nYou can combine multiple images into a single PDF with control over page order. Everything runs in your browser — no uploads, no accounts, and no watermarks. Your images stay on your device throughout the process.",
    howToSteps: [
      "Select or drag and drop one or more image files (JPG, PNG, etc.).",
      "Arrange the images in the desired page order.",
      "Click Convert and download the resulting PDF.",
    ],
    whyUseContent:
      "Converting images to PDF should be instant and free. This browser-based tool requires no installation, supports all common image formats, and keeps your files private by processing everything locally. Works on any device.",
    privacyBlurb:
      "Your images are converted to PDF entirely in your browser. No files are uploaded to any server, no data is stored, and no third party has access to your images. Close the tab and all processing data is cleared.",
    faqs: [
      {
        question: "What image formats are supported?",
        answer:
          "The tool supports JPG, JPEG, PNG, WebP, and other common image formats that your browser can render.",
      },
      {
        question: "Can I combine multiple images into one PDF?",
        answer:
          "Yes. Upload multiple images and each one becomes a page in the output PDF. You can reorder them before converting.",
      },
      {
        question: "Will my images lose quality in the conversion?",
        answer:
          "Images are embedded into the PDF at their original resolution, so there is no quality loss during conversion.",
      },
    ],
    relatedTools: ["pdf-to-image", "compress-pdf", "merge-pdf"],
  },

  "pdf-to-image": {
    slug: "pdf-to-image",
    toolId: "pdftoimage",
    label: "PDF to Image",
    shortDesc: "Convert pages to PNG",
    color: "#f472b6",
    category: "convert",
    seoTitle:
      "Convert PDF to Image Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert PDF pages to high-quality PNG images in your browser. Free, browser-based, and private — your files never leave your device.",
    h1: "Convert PDF to Image Online — Free PDF to PNG Converter",
    keywords:
      "pdf to image, pdf to png, pdf to jpg, convert pdf to image, pdf to picture, pdf to image online free",
    introText:
      "Converting PDF pages to images is useful for sharing on social media, embedding in presentations, creating thumbnails, or working with content that requires image formats. Our free tool renders each page of your PDF as a high-quality PNG image.\n\nAll rendering happens in your browser using the same technology that displays PDFs in web browsers. No upload, no server processing, and no quality loss. Download individual page images or all pages at once.",
    howToSteps: [
      "Upload the PDF file you want to convert to images.",
      "Choose the output quality and select which pages to convert.",
      "Click Convert and download your PNG images.",
    ],
    whyUseContent:
      "Converting PDFs to images should be fast and free. This tool renders pages directly in your browser at high quality, requires no software installation, and keeps your files private. Works on every device with a modern browser.",
    privacyBlurb:
      "PDF rendering and image conversion happen entirely in your browser. Your PDF is never uploaded or transmitted to any server. No data is collected or stored. Your documents remain completely private.",
    faqs: [
      {
        question: "What image format are the output files?",
        answer:
          "Pages are converted to PNG format, which provides lossless quality and is widely supported across all platforms and applications.",
      },
      {
        question: "Can I convert specific pages instead of the entire PDF?",
        answer:
          "Yes. You can select individual pages or page ranges to convert, rather than processing the entire document.",
      },
      {
        question: "What resolution are the output images?",
        answer:
          "The tool renders pages at a high resolution suitable for viewing and sharing. The exact pixel dimensions depend on the original page size.",
      },
    ],
    relatedTools: ["image-to-pdf", "compress-pdf", "split-pdf"],
  },

  "pdf-to-word": {
    slug: "pdf-to-word",
    toolId: "pdftodocx",
    label: "PDF to Word",
    shortDesc: "Convert to editable DOCX",
    color: "#60a5fa",
    category: "convert",
    seoTitle:
      "Convert PDF to Word Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert PDF files to editable Word documents in your browser. Free, browser-based, and private — your files never leave your device.",
    h1: "Convert PDF to Word Online — Free PDF to DOCX Converter",
    keywords:
      "pdf to word, pdf to docx, convert pdf to word, pdf to editable document, pdf to word online free",
    introText:
      "Need to edit the content of a PDF? Converting it to a Word document makes the text fully editable in Microsoft Word, Google Docs, or any other word processor. Our free converter extracts text and basic formatting from your PDF and generates a DOCX file.\n\nThe conversion happens entirely in your browser, which means your documents are never uploaded to a server. This is especially important for sensitive or confidential files that should not leave your device.",
    howToSteps: [
      "Upload the PDF file you want to convert to Word.",
      "Wait while the tool processes and extracts the content.",
      "Download the resulting DOCX file and open it in your word processor.",
    ],
    whyUseContent:
      "Converting PDF to Word should not require paid software or uploading confidential documents to a cloud service. This free, browser-based tool processes your file locally, keeps your data private, and works on any device with no installation.",
    privacyBlurb:
      "The entire conversion from PDF to Word is performed in your browser. Your file is never uploaded to any server, and no data is stored or transmitted. This ensures complete privacy for sensitive documents.",
    faqs: [
      {
        question: "How accurate is the PDF to Word conversion?",
        answer:
          "The tool extracts text and basic formatting. Simple text-based PDFs convert very well. Complex layouts with tables, columns, or heavy formatting may require some manual adjustment after conversion.",
      },
      {
        question: "Can I convert scanned PDFs to Word?",
        answer:
          "This tool works with text-based PDFs. Scanned PDFs that contain only images would need OCR (optical character recognition) first, which is not included in this browser-based tool.",
      },
      {
        question: "Do I need Microsoft Word to open the output?",
        answer:
          "No. The DOCX format is supported by Microsoft Word, Google Docs, LibreOffice Writer, and many other word processors.",
      },
    ],
    relatedTools: ["word-to-pdf", "pdf-to-excel", "compress-pdf"],
  },

  "word-to-pdf": {
    slug: "word-to-pdf",
    toolId: "docxtopdf",
    label: "Word to PDF",
    shortDesc: "Convert DOCX to PDF",
    color: "#60a5fa",
    category: "convert",
    seoTitle:
      "Convert Word to PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert Word documents to PDF directly in your browser. Free, browser-based, and private — your files never leave your device. No upload required.",
    h1: "Convert Word to PDF Online — Free DOCX to PDF Converter",
    keywords:
      "word to pdf, docx to pdf, convert word to pdf, doc to pdf, word to pdf online free",
    introText:
      "Converting Word documents to PDF ensures consistent formatting across all devices and platforms. PDFs preserve your layout, fonts, and design exactly as intended, making them ideal for sharing reports, resumes, contracts, and other professional documents.\n\nOur free converter processes your DOCX file entirely in your browser. No upload to a server, no waiting in a queue, and no watermarks on the output. The conversion is instant and your document remains private.",
    howToSteps: [
      "Upload your Word document (DOCX format).",
      "Wait while the tool converts the content to PDF.",
      "Download the resulting PDF file.",
    ],
    whyUseContent:
      "Converting Word to PDF should be free and instant. This browser-based tool requires no installation, preserves your document formatting, and processes everything locally. Your files stay private and the conversion works on any device.",
    privacyBlurb:
      "Your Word document is converted to PDF entirely in your browser. No file data is sent to any server, nothing is stored or logged, and your document remains completely private throughout the process.",
    faqs: [
      {
        question: "Will the formatting be preserved in the PDF?",
        answer:
          "The tool preserves text, headings, basic formatting, and structure. Some advanced Word features like complex tables or embedded macros may not convert perfectly.",
      },
      {
        question: "Can I convert DOC files or only DOCX?",
        answer:
          "This tool supports the modern DOCX format. If you have an older DOC file, you can open it in Word or LibreOffice and save it as DOCX first.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "There is no server-imposed limit. Since processing happens in your browser, the practical limit depends on your device's memory. Most typical documents convert without any issues.",
      },
    ],
    relatedTools: ["pdf-to-word", "excel-to-pdf", "compress-pdf"],
  },

  "pdf-to-excel": {
    slug: "pdf-to-excel",
    toolId: "pdftoexcel",
    label: "PDF to Excel",
    shortDesc: "Extract tables to spreadsheet",
    color: "#4ade80",
    category: "convert",
    seoTitle:
      "Convert PDF to Excel Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Extract tables from PDF files into Excel spreadsheets in your browser. Free, private, and no upload needed — files are processed on your device.",
    h1: "Convert PDF to Excel Online — Free PDF to Spreadsheet Converter",
    keywords:
      "pdf to excel, pdf to xlsx, extract table from pdf, pdf to spreadsheet, convert pdf to excel online free",
    introText:
      "Financial reports, invoices, data tables, and other structured content often get locked inside PDF files. Our free PDF to Excel converter extracts tabular data from your PDF and generates a spreadsheet you can edit, analyze, and manipulate in Excel or Google Sheets.\n\nThe extraction happens entirely in your browser, so your financial data and business documents are never uploaded to any server. No installation, no account, and no limits on usage.",
    howToSteps: [
      "Upload the PDF file containing tables or data.",
      "Wait while the tool extracts and structures the content.",
      "Download the resulting Excel (XLSX) file.",
    ],
    whyUseContent:
      "Extracting data from PDFs into a spreadsheet should be free and private. This browser-based tool processes your file locally, so sensitive financial and business data never leaves your device. Works on any platform with no software to install.",
    privacyBlurb:
      "All data extraction is performed in your browser. Your PDF is not uploaded to any server, and no data is stored or transmitted externally. This is especially important for financial documents and business data that must remain confidential.",
    faqs: [
      {
        question: "How well does it extract tables from PDFs?",
        answer:
          "The tool works best with PDFs that contain clearly structured tables. Simple, well-formatted tables convert accurately. Complex or nested tables may require manual cleanup in the spreadsheet.",
      },
      {
        question: "Can I convert a multi-page PDF with tables?",
        answer:
          "Yes. The tool processes all pages and extracts tabular content from each one into the resulting spreadsheet.",
      },
      {
        question: "What spreadsheet format is the output?",
        answer:
          "The output is in XLSX format, which is compatible with Microsoft Excel, Google Sheets, LibreOffice Calc, and other spreadsheet applications.",
      },
    ],
    relatedTools: ["excel-to-pdf", "pdf-to-word", "compress-pdf"],
  },

  "excel-to-pdf": {
    slug: "excel-to-pdf",
    toolId: "exceltopdf",
    label: "Excel to PDF",
    shortDesc: "Convert spreadsheet to PDF",
    color: "#4ade80",
    category: "convert",
    seoTitle:
      "Convert Excel to PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert Excel spreadsheets to PDF directly in your browser. Free, browser-based, and private — your files never leave your device. No upload required.",
    h1: "Convert Excel to PDF Online — Free XLSX to PDF Converter",
    keywords:
      "excel to pdf, xlsx to pdf, spreadsheet to pdf, convert excel to pdf, excel to pdf online free",
    introText:
      "Converting an Excel spreadsheet to PDF freezes your data and formatting into a fixed layout that looks the same on every device. This is ideal for sharing reports, financial statements, invoices, and any tabular data that recipients should view but not edit.\n\nOur free converter processes your XLSX file entirely in your browser. The spreadsheet data never leaves your device, making this a safe option for sensitive financial documents. No sign-up, no watermarks, instant results.",
    howToSteps: [
      "Upload your Excel file (XLSX format).",
      "Wait while the tool renders the spreadsheet as a PDF.",
      "Download the resulting PDF file.",
    ],
    whyUseContent:
      "Converting spreadsheets to PDF should be free and fast. This tool runs in your browser, requires no installation, and keeps your data private. Perfect for sharing financial data, reports, and tables in a universally readable format.",
    privacyBlurb:
      "Your spreadsheet is converted to PDF entirely in your browser. No data is sent to any server, nothing is stored, and your financial data remains completely confidential. Close the tab and all processing data is released.",
    faqs: [
      {
        question: "Will the table formatting be preserved?",
        answer:
          "The tool renders your spreadsheet data into a clean table layout in the PDF. Basic formatting like column widths and text alignment are preserved.",
      },
      {
        question: "Can I convert files with multiple sheets?",
        answer:
          "The tool processes the spreadsheet data and converts it into a PDF. Multiple sheets will be included in the output.",
      },
      {
        question: "What Excel formats are supported?",
        answer:
          "The tool supports XLSX files. If you have an older XLS file, save it as XLSX in Excel or LibreOffice first.",
      },
    ],
    relatedTools: ["pdf-to-excel", "word-to-pdf", "compress-pdf"],
  },

  "pdf-to-powerpoint": {
    slug: "pdf-to-powerpoint",
    toolId: "pdftopptx",
    label: "PDF to PowerPoint",
    shortDesc: "Convert to presentation slides",
    color: "#fb923c",
    category: "convert",
    seoTitle:
      "Convert PDF to PowerPoint Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert PDF files to editable PowerPoint presentations in your browser. Free, private, and no upload needed — files never leave your device.",
    h1: "Convert PDF to PowerPoint Online — Free PDF to PPTX Converter",
    keywords:
      "pdf to powerpoint, pdf to pptx, convert pdf to slides, pdf to presentation, pdf to powerpoint online free",
    introText:
      "Need to turn a PDF into an editable presentation? Our free converter transforms PDF pages into PowerPoint slides that you can edit, annotate, and present. Each page becomes a slide with the content rendered as an image, ready for you to add notes or overlay new content.\n\nThe conversion runs entirely in your browser. Your PDF is never uploaded to any server, ensuring complete privacy for business presentations, lecture materials, and confidential decks.",
    howToSteps: [
      "Upload the PDF file you want to convert to PowerPoint.",
      "Wait while the tool processes each page into a slide.",
      "Download the resulting PPTX file and open it in PowerPoint or Google Slides.",
    ],
    whyUseContent:
      "Converting PDF to PowerPoint should not require paid subscriptions or cloud uploads. This free tool works in any browser, processes files locally for complete privacy, and produces editable PPTX files. No installation needed.",
    privacyBlurb:
      "Your PDF is converted to PowerPoint entirely in your browser. No files are uploaded, no data is transmitted to any server, and nothing is stored. Your presentations and documents remain completely private.",
    faqs: [
      {
        question: "Are the slides editable in PowerPoint?",
        answer:
          "Yes. Each PDF page is converted into a slide. The content is rendered as an image on each slide, and you can add text, shapes, and notes on top in PowerPoint or Google Slides.",
      },
      {
        question: "Will animations and transitions be included?",
        answer:
          "No. The conversion creates static slides from PDF pages. You can add animations and transitions manually in your presentation software afterward.",
      },
      {
        question: "Can I convert specific pages only?",
        answer:
          "The tool converts all pages of the PDF into slides. If you need only certain pages, use the Extract tool first to create a PDF with just those pages.",
      },
    ],
    relatedTools: ["powerpoint-to-pdf", "pdf-to-word", "pdf-to-image"],
  },

  "powerpoint-to-pdf": {
    slug: "powerpoint-to-pdf",
    toolId: "pptxtopdf",
    label: "PowerPoint to PDF",
    shortDesc: "Convert slides to PDF",
    color: "#fb923c",
    category: "convert",
    seoTitle:
      "Convert PowerPoint to PDF Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Convert PowerPoint presentations to PDF directly in your browser. Free, browser-based, and private — files never leave your device. No upload required.",
    h1: "Convert PowerPoint to PDF Online — Free PPTX to PDF Converter",
    keywords:
      "powerpoint to pdf, pptx to pdf, convert slides to pdf, presentation to pdf, powerpoint to pdf online free",
    introText:
      "Converting a PowerPoint presentation to PDF ensures your slides look exactly the same on every device, regardless of whether the viewer has PowerPoint installed. PDFs preserve your layout, images, and text perfectly for sharing and printing.\n\nOur free converter handles PPTX files entirely in your browser. No upload to any server means your business presentations, lecture slides, and confidential material stay completely private. Instant results with no account required.",
    howToSteps: [
      "Upload your PowerPoint file (PPTX format).",
      "Wait while the tool converts each slide to a PDF page.",
      "Download the resulting PDF file.",
    ],
    whyUseContent:
      "Converting presentations to PDF should be free, instant, and private. This browser-based tool requires no software installation, works on any device, and processes your file locally. Perfect for sharing slides that look consistent everywhere.",
    privacyBlurb:
      "Your PowerPoint file is converted to PDF entirely in your browser. No data leaves your device, nothing is uploaded to any server, and no information is stored or logged. Your presentations remain completely confidential.",
    faqs: [
      {
        question: "Will the slide formatting be preserved?",
        answer:
          "The tool preserves text, images, and basic slide layouts. Complex animations and transitions are not included in a PDF, but the visual layout of each slide is maintained.",
      },
      {
        question: "Can I convert older PPT files?",
        answer:
          "This tool supports PPTX format. If you have an older PPT file, open it in PowerPoint or LibreOffice Impress and save it as PPTX first.",
      },
      {
        question: "Is there a limit on the number of slides?",
        answer:
          "There is no server-imposed limit. The conversion happens in your browser, so the practical limit depends on your device's memory. Most presentations convert without any issues.",
      },
    ],
    relatedTools: ["pdf-to-powerpoint", "word-to-pdf", "compress-pdf"],
  },

  "edit-text": {
    slug: "edit-text",
    toolId: "edittext",
    label: "Edit Text",
    shortDesc: "Modify text directly in your PDF",
    color: "#f59e0b",
    category: "edit",
    seoTitle: "Edit PDF Text Online for Free — No Upload Required | PDF Tools",
    seoDescription:
      "Edit text directly in your PDF without converting to Word. Change dates, fix typos, and update text — all in your browser. Free, private, and no upload needed.",
    h1: "Edit PDF Text Online — Free PDF Text Editor",
    keywords:
      "edit pdf text, modify pdf text, change text in pdf, pdf text editor, edit pdf online free, update pdf text, change date on pdf",
    introText:
      "Need to make a quick text change to a PDF? Whether it is fixing a typo, updating a date on a certificate, or changing a name on a form, this tool lets you click on any text in your PDF and edit it directly — no conversion needed.\n\nBecause all processing happens locally on your device, your files are never uploaded to any server. The original PDF structure is preserved — only the text you change is modified. There is nothing to install and no account to create.",
    howToSteps: [
      "Open your PDF file using the file picker or drag and drop.",
      "Click on any text in the PDF to select it for editing.",
      "Type your changes and adjust font, size, or color if needed.",
      "Click Apply Edits to download your updated PDF.",
    ],
    whyUseContent:
      "This PDF text editor is completely free, requires no software installation, and works on any device with a modern browser. Unlike other tools that convert your PDF to Word and back, this tool modifies text directly while preserving the rest of your document. Because it runs entirely client-side, your documents stay private — nothing is uploaded or stored on a remote server.",
    privacyBlurb:
      "Your files are processed entirely in your browser using client-side JavaScript. No data is sent to any server, no files are stored remotely, and no one else can access your documents. Once you close the tab, the processed data is gone.",
    faqs: [
      {
        question: "Can I edit any text in a PDF?",
        answer:
          "You can edit text in any PDF that contains selectable text. Scanned PDFs (which are essentially images) require OCR first and cannot be edited with this tool. The edited text uses standard fonts (Helvetica, Times, Courier) which closely match most common document fonts.",
      },
      {
        question: "Will the rest of my PDF be affected?",
        answer:
          "No. Only the text you change is modified. The rest of the document — images, layout, formatting, other text — remains exactly as it was. Unedited pages pass through completely untouched.",
      },
      {
        question: "Does this tool change the original text in the PDF?",
        answer:
          "This tool places new text over the original while covering the old text with a matching background. The visual result is a clean edit, but the original text data may remain in the file structure. For sensitive content that must be permanently removed, use our Redact tool first.",
      },
      {
        question: "What fonts are available for edited text?",
        answer:
          "Edited text can use three standard PDF font families: Helvetica (sans-serif), Times (serif), and Courier (monospace). Each is available in regular and bold weights. These fonts are universally supported in all PDF viewers.",
      },
    ],
    relatedTools: ["redact-pdf", "sign-pdf", "watermark-pdf"],
  },
};

/* ── Lookup helpers ──────────────────────────────────── */

export function getToolBySlug(slug: string): ToolPageData | undefined {
  return TOOLS[slug];
}

export function getToolByToolId(toolId: ToolId): ToolPageData | undefined {
  return Object.values(TOOLS).find((t) => t.toolId === toolId);
}

export function getAllSlugs(): string[] {
  return Object.keys(TOOLS);
}
