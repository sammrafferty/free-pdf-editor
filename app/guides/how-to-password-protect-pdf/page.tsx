import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";

export const metadata: Metadata = {
  title: "How to Password Protect a PDF — Free Methods | PDF Tools",
  description: "Learn how to password protect a PDF file for free. Step-by-step instructions for Windows, Mac, and online tools.",
  keywords: "password protect PDF, encrypt PDF, lock PDF, PDF password, secure PDF file",
  alternates: {
    canonical: "/guides/how-to-password-protect-pdf",
  },
  openGraph: {
    title: "How to Password Protect a PDF — Free Methods | PDF Tools",
    description: "Learn how to password protect a PDF file for free. Step-by-step instructions for Windows, Mac, and online tools.",
    url: "/guides/how-to-password-protect-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Password Protect a PDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Password Protect a PDF — Free Methods | PDF Tools",
    description: "Password protect a PDF for free — step-by-step instructions for every platform.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Password Protect a PDF",
  description: "Learn how to password protect a PDF file for free using multiple methods on Windows, Mac, and online.",
  step: [
    { "@type": "HowToStep", name: "Choose a method", text: "Select a tool based on your platform: Adobe Acrobat, LibreOffice, Preview (Mac), Microsoft Word, or an online tool." },
    { "@type": "HowToStep", name: "Open your PDF", text: "Open the PDF file in your chosen application." },
    { "@type": "HowToStep", name: "Set a password", text: "Navigate to the security or encryption settings and enter a strong password." },
    { "@type": "HowToStep", name: "Choose permissions", text: "Optionally set an owner password to restrict printing, copying, or editing." },
    { "@type": "HowToStep", name: "Save the protected PDF", text: "Save or export the file. The PDF now requires a password to open or modify." },
  ],
  tool: [
    { "@type": "HowToTool", name: "Adobe Acrobat" },
    { "@type": "HowToTool", name: "LibreOffice" },
    { "@type": "HowToTool", name: "Preview (macOS)" },
    { "@type": "HowToTool", name: "Microsoft Word" },
  ],
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "How to Password Protect a PDF", item: "https://free-pdf-editor.org/guides/how-to-password-protect-pdf" },
  ],
};

export default function PasswordProtectGuide() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />
      <div className="navbar-spacer" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:opacity-80">Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <Link href="/guides" className="hover:opacity-80">Guides</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ color: "var(--text-secondary)" }}>How to Password Protect a PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Password Protect a PDF
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Password protection prevents unauthorized people from opening, copying, or printing your PDF. Whether you&apos;re sending a contract to a client, sharing financial records, or archiving sensitive files, adding a password takes less than a minute with the right tool. Here are five free methods that work on any platform.
        </p>

        <div className="theme-prose space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Why Password Protect a PDF?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              An unprotected PDF is readable by anyone who has the file. If it ends up in the wrong inbox, on a shared drive, or in a data breach, all of its contents are exposed. Password protection adds a layer of encryption that makes the document unreadable without the correct password.
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Confidential documents.</strong> Financial statements, medical records, employee data, legal agreements, and business plans often contain information that should only be seen by specific people.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Legal and regulatory compliance.</strong> Industries like healthcare (HIPAA), finance (SOX, GDPR), and law often require documents to be encrypted in transit and at rest. Password-protecting PDFs is one of the simplest ways to meet these requirements.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Controlling access when sharing.</strong> When you email a PDF to multiple recipients, you lose control of who sees it once it arrives. A password ensures that even if the email is forwarded, only people who know the password can view the document.</li>
            </ul>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Types of PDF Protection</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              The PDF format supports two distinct types of password protection. Understanding the difference helps you choose the right level of security for your situation.
            </p>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>User password (open password):</strong> This prevents anyone from opening the PDF without entering the password. The entire document is encrypted, and without the password, the file is just unreadable data. This is the stronger option — use it when the document&apos;s contents are truly confidential.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Owner password (permissions password):</strong> This allows anyone to open and read the PDF, but restricts specific actions like printing, copying text, or editing the document. It&apos;s useful when you want people to view a document but not reproduce or modify it — for example, distributing a report that shouldn&apos;t be copied into other materials. Note that owner passwords are less secure than user passwords; some tools can remove permission restrictions without the password.</p>
            </div>
            <p style={{ color: "var(--text-secondary)" }}>
              Many tools let you set both simultaneously: a user password to control who can open the file, and an owner password to control what they can do with it.
            </p>
          </div>

          <AdSlot slot="guide-password-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 1: Using Adobe Acrobat</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Adobe Acrobat Pro is the most feature-complete option for PDF security, though it requires a paid subscription (roughly $20/month).
            </p>
            <ol className="list-decimal pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Open your PDF in Adobe Acrobat Pro.</li>
              <li>Go to <strong style={{ color: "var(--text-primary)" }}>File &gt; Protect Using Password</strong> (or <strong style={{ color: "var(--text-primary)" }}>Tools &gt; Protect &gt; Encrypt with Password</strong>).</li>
              <li>Choose whether to restrict viewing (user password) or editing (owner password), or both.</li>
              <li>Enter your password. Acrobat will rate its strength.</li>
              <li>Select the encryption level. AES-256 is the current standard — use it unless you have a specific reason to use an older encryption method.</li>
              <li>Click <strong style={{ color: "var(--text-primary)" }}>OK</strong>, then save the file.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              Acrobat also allows you to set granular permissions: allow printing but prevent copying, allow form filling but prevent page extraction, and so on. If you need fine-grained control over document permissions, Acrobat is the most capable tool.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 2: Using LibreOffice (Free, Open Source)</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              LibreOffice is completely free and works on Windows, macOS, and Linux. It can add password protection when exporting a document to PDF.
            </p>
            <ol className="list-decimal pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Open your document in LibreOffice (Writer, Draw, or Impress — whichever matches your file type). If you already have a PDF, open it in LibreOffice Draw.</li>
              <li>Go to <strong style={{ color: "var(--text-primary)" }}>File &gt; Export as PDF</strong>.</li>
              <li>In the PDF Options dialog, click the <strong style={{ color: "var(--text-primary)" }}>Security</strong> tab.</li>
              <li>Click <strong style={{ color: "var(--text-primary)" }}>Set Passwords</strong>. You can set an open password, a permissions password, or both.</li>
              <li>Configure permission restrictions if desired (printing, copying, modifying).</li>
              <li>Click <strong style={{ color: "var(--text-primary)" }}>Export</strong> and choose a save location.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              This is the best free desktop option for password protection. LibreOffice supports AES-128 encryption, which is strong enough for most purposes. The main downside is that opening complex PDFs in LibreOffice Draw may alter some formatting.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 3: Using Preview on Mac</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              If you&apos;re on macOS, the built-in Preview app can add password protection to any PDF without installing additional software.
            </p>
            <ol className="list-decimal pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Open the PDF in Preview.</li>
              <li>Go to <strong style={{ color: "var(--text-primary)" }}>File &gt; Export</strong> (not &ldquo;Save&rdquo;).</li>
              <li>Check the <strong style={{ color: "var(--text-primary)" }}>Encrypt</strong> checkbox at the bottom of the export dialog.</li>
              <li>Enter and verify your password.</li>
              <li>Click <strong style={{ color: "var(--text-primary)" }}>Save</strong>.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              Preview&apos;s password protection is straightforward but limited. It only supports a user password (preventing opening). You can&apos;t set separate owner permissions or choose the encryption level. For simple &ldquo;lock this file with a password&rdquo; needs, it&apos;s quick and effective.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 4: Using Microsoft Word</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Microsoft Word can save documents as password-protected PDFs, which is useful if your document originates in Word.
            </p>
            <ol className="list-decimal pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Open your document in Microsoft Word.</li>
              <li>Go to <strong style={{ color: "var(--text-primary)" }}>File &gt; Save As</strong> (or <strong style={{ color: "var(--text-primary)" }}>Export &gt; Create PDF/XPS</strong>).</li>
              <li>Choose PDF as the file type.</li>
              <li>Click <strong style={{ color: "var(--text-primary)" }}>Options</strong> and check <strong style={{ color: "var(--text-primary)" }}>Encrypt the document with a password</strong>.</li>
              <li>Enter your password and click <strong style={{ color: "var(--text-primary)" }}>OK</strong>.</li>
              <li>Click <strong style={{ color: "var(--text-primary)" }}>Save</strong>.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              This method is convenient when you&apos;re already working in Word. However, it only adds an open password — you can&apos;t set separate owner permissions. Also, this feature is available in the desktop version of Word, not the free web version.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 5: Using Online Tools</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Several online services offer PDF password protection, including Smallpdf, iLovePDF, and others. These tools work in any browser without installing software. However, there&apos;s an important privacy consideration.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Your file gets uploaded to a remote server.</strong> When you use a server-based online tool to encrypt a PDF, the unencrypted version of your document passes through someone else&apos;s infrastructure before the password is applied. This defeats much of the purpose of password protection if the document is sensitive. The services claim to delete files after processing, but you&apos;re trusting their word and their security practices.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              If the document isn&apos;t sensitive — for example, you&apos;re password-protecting a shared album of vacation photos — an online tool is fine. For contracts, financial data, medical records, or anything confidential, use one of the offline methods above instead.
            </p>
          </div>

          <AdSlot slot="guide-password-strength" format="rectangle" className="my-6 sm:my-8" />

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How Strong Should Your PDF Password Be?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              The encryption is only as strong as the password protecting it. A weak password can be cracked in seconds by brute-force tools, rendering the encryption meaningless.
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Length matters most.</strong> Aim for at least 12 characters. Every additional character exponentially increases the time needed to crack the password. A 16-character password is orders of magnitude stronger than an 8-character one.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Mix character types.</strong> Use uppercase letters, lowercase letters, numbers, and symbols. &ldquo;Tr33$_in_March!&rdquo; is far stronger than &ldquo;password123.&rdquo;</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Avoid dictionary words and patterns.</strong> Password-cracking tools try common words, phrases, and keyboard patterns first. &ldquo;qwerty,&rdquo; &ldquo;123456,&rdquo; and &ldquo;password&rdquo; are among the first things they try.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Use a passphrase.</strong> A string of random words like &ldquo;correct-horse-battery-staple&rdquo; is both strong and memorable. Add a number and a symbol to make it even stronger.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Share the password separately.</strong> Never include the password in the same email as the PDF. Send it via a different channel — a text message, a phone call, or a separate email. If the email is intercepted, the attacker won&apos;t have both the file and the key.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Additional Ways to Protect PDF Content</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Password protection controls who can access the entire document. But sometimes you need more targeted protection:
            </p>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Redact sensitive information.</strong> If only parts of a document are confidential — Social Security numbers, account numbers, names in a legal document — you can permanently remove that content while sharing the rest. The <Link href="/?tool=redact" className="theme-link hover:underline">Redact PDF tool</Link> blacks out selected areas so the underlying text is completely removed, not just hidden.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Add a watermark for tracking.</strong> Watermarks like &ldquo;CONFIDENTIAL&rdquo; or a recipient&apos;s name help deter unauthorized sharing and track the source if a document leaks. The <Link href="/?tool=watermark" className="theme-link hover:underline">Add Watermark tool</Link> places customizable text across every page of your PDF.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Sign the document.</strong> A digital signature using the <Link href="/?tool=sign" className="theme-link hover:underline">Sign PDF tool</Link> confirms the document&apos;s authenticity and shows whether it has been tampered with after signing. This doesn&apos;t prevent access but does verify integrity.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can a password-protected PDF be cracked?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Technically, yes — any encryption can be cracked given enough time and computing power. However, a PDF encrypted with AES-256 and a strong password (12+ characters, mixed types) would take billions of years to crack with current technology. The practical risk is negligible for a well-chosen password. Weak passwords like &ldquo;1234&rdquo; or &ldquo;password&rdquo; can be cracked in seconds.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>What happens if I forget the password?</h3>
                <p style={{ color: "var(--text-secondary)" }}>If you set a user password (open password) and forget it, the document is effectively locked permanently. There is no backdoor or &ldquo;forgot password&rdquo; recovery for encrypted PDFs. Some third-party tools claim to remove PDF passwords, but they only work on weak owner passwords (permission restrictions), not on strong open passwords with modern encryption.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Does password protection affect the file size?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Barely. Encryption adds a tiny amount of overhead — typically a few kilobytes regardless of the document size. A 5 MB PDF will still be approximately 5 MB after encryption. You won&apos;t notice any difference in file size or loading speed.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I remove a password from a PDF later?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes, if you know the password. Open the protected PDF, enter the password, and then save or export it without encryption. In Adobe Acrobat, go to File &gt; Properties &gt; Security and change the security method to &ldquo;No Security.&rdquo; In Preview on Mac, use File &gt; Export and uncheck the Encrypt box. This gives you an unprotected copy.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/?tool=redact" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try Redact PDF
            </Link>
            <Link href="/guides" className="text-sm theme-link hover:underline">View all guides</Link>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <span>All processing happens locally in your browser.</span>
            <div className="flex items-center gap-4">
              <Link href="/guides" className="footer-link hover:opacity-80 transition-opacity">Guides</Link>
              <Link href="/faq" className="footer-link hover:opacity-80 transition-opacity">FAQ</Link>
              <Link href="/privacy" className="footer-link hover:opacity-80 transition-opacity">Privacy</Link>
              <Link href="/terms" className="footer-link hover:opacity-80 transition-opacity">Terms</Link>
              <Link href="/about" className="footer-link hover:opacity-80 transition-opacity">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
