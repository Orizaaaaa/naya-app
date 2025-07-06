'use client'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import html2pdf from 'html2pdf.js';
import dynamic from 'next/dynamic';
import React, { useRef, useState } from 'react'


const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

type Props = {}

function page({ }: Props) {
    const editor = useRef(null);
    const [content, setContent] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = () => {
        if (!printRef.current) return;

        html2pdf()
            .set({
                margin: 0.5,
                filename: 'template-surat.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            })
            .from(printRef.current)
            .save();
    };

    console.log(content);

    return (
        <DefaultLayout>
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Editor Template Surat</h1>

                <div className="border mb-4">
                    <JoditEditor
                        ref={editor}
                        value={content}
                        onBlur={(newContent) => setContent(newContent)}
                    />
                </div>

                <button
                    onClick={handleDownloadPDF}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Download PDF
                </button>

                <h2 className="text-lg font-semibold mt-8 mb-2">Preview Template (Untuk PDF)</h2>

                {/* Ini bagian yang akan dijadikan PDF */}
                <div
                    ref={printRef}
                    className="p-8 bg-white border mt-4 w-[210mm] min-h-[297mm]"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </DefaultLayout>

    )
}

export default page