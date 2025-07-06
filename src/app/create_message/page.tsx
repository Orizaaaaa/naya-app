'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import html2pdf from 'html2pdf.js';

// Asumsi DefaultLayout adalah komponen layout dasar Anda.
// Jika Anda tidak memiliki komponen ini, Anda bisa menggantinya dengan div kosong atau menyesuaikan sesuai kebutuhan.
const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-100 p-4">
        {children}
    </div>
);

// Dynamic import JoditEditor untuk memastikan hanya di-render di sisi klien
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

function Page() {
    const editor = useRef(null);
    const printRef = useRef<HTMLDivElement>(null); // Ref untuk div pratinjau A4
    const measurementRef = useRef<HTMLDivElement>(null); // Ref untuk div pengukuran tersembunyi

    const [template, setTemplate] = useState<string>(`
    <h2 class="text-center" style="text-align: center;">SURAT KETERANGAN</h2>
    <p>Nama: {nama}</p>
    <p>Kelas: {kelas}</p>
    <p>Alasan: {alasan}</p>
    <p>Tanggal: {tanggal}</p>
    <p>
      Silakan ketik isi surat sebanyak apapun langsung di editor ini tanpa batasan. Jika panjang, maka akan otomatis terbagi ke beberapa halaman A4 saat ditampilkan dan diunduh sebagai PDF.
      Ini adalah paragraf contoh untuk menguji tampilan multi-halaman. Anda bisa menambahkan lebih banyak teks di sini untuk melihat bagaimana halaman akan terbagi secara otomatis. Pastikan untuk mengisi formulir di bawah ini untuk melihat pratinjau yang terisi.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>
      Curabitur pretium tincidunt lacus. Nulla facilisi. Aliquam erat volutpat. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper et, sollicitudin eu, nulla. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui ligula, fringilla a, euismod sodales, sollicitudin vel, wisi. Morbi auctor lorem non est.
    </p>
    <p>
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et ipsum sagittis fermentum. Ut ac quam. Nunc eget est. Phasellus et lorem. Vivamus sollicitudin.
    </p>
    `);

    const [formData, setFormData] = useState({
        nama: 'Budi Santoso',
        kelas: 'XII IPA 1',
        alasan: 'Sakit',
        tanggal: '06 Juli 2025',
    });

    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const [isMultiPage, setIsMultiPage] = useState<boolean>(false);

    // Fungsi untuk mengisi template dengan data
    const generateFromTemplate = useCallback((templateString: string, data: Record<string, string>) => {
        let result = templateString;
        Object.entries(data).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        return result;
    }, []);

    // Effect untuk mendeteksi apakah konten melebihi satu halaman A4
    useEffect(() => {
        if (filledTemplate && measurementRef.current) {
            // Set timeout untuk memastikan DOM sudah dirender sepenuhnya
            const timeoutId = setTimeout(() => {
                const contentHeight = measurementRef.current?.scrollHeight || 0;
                // Tinggi A4 dalam mm adalah 297mm.
                // Padding 20mm di setiap sisi (atas/bawah). Jadi tinggi area konten efektif adalah 297 - (20*2) = 257mm.
                // Kita akan membandingkan scrollHeight dengan tinggi container A4 yang sudah termasuk padding.
                // Karena kita menggunakan 'mm' di CSS, browser akan mengkonversinya ke piksel.
                // Kita bisa mendapatkan tinggi A4 yang di-render oleh browser dari offsetHeight elemen.
                const a4HeightInPx = measurementRef.current?.offsetHeight || 0;

                // Toleransi kecil karena perbedaan rendering antar browser atau pembulatan piksel
                const tolerance = 5; // piksel

                if (contentHeight > a4HeightInPx + tolerance) {
                    setIsMultiPage(true);
                } else {
                    setIsMultiPage(false);
                }
            }, 100); // Penundaan singkat untuk memastikan rendering selesai

            return () => clearTimeout(timeoutId);
        }
    }, [filledTemplate]);

    const handleGenerate = () => {
        const result = generateFromTemplate(template, formData);
        setFilledTemplate(result);
    };

    const handleDownloadPDF = () => {
        if (!printRef.current) {
            console.error("Print reference is not available.");
            return;
        }

        // Dapatkan lebar dan tinggi elemen pratinjau yang di-render
        const previewWidth = printRef.current.offsetWidth;
        const previewHeight = printRef.current.offsetHeight;

        html2pdf()
            .set({
                margin: [20, 20, 20, 20], // Margin atas, kiri, bawah, kanan (sesuai padding A4)
                filename: 'surat-multi-halaman.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2, // Skala rendering HTML ke kanvas
                    useCORS: true,
                    width: previewWidth, // Gunakan lebar pratinjau yang di-render
                    windowWidth: previewWidth // Penting untuk konsistensi lebar
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    // Posisi X dan Y untuk memulai konten PDF
                    // 20mm adalah margin kiri dan atas
                    x: 20,
                    y: 20,
                },
                // Menambahkan 'width' untuk secara eksplisit menentukan lebar area konten untuk rendering
                // Lebar A4 (210mm) dikurangi margin kiri dan kanan (2 * 20mm) = 170mm
                width: 170,
            })
            .from(printRef.current)
            .save();
    };

    // Konfigurasi Jodit Editor
    const joditConfig = {
        readonly: false, // false untuk mode edit
        height: 'auto', // Tinggi otomatis, akan menyesuaikan dengan konten
        minHeight: '297mm', // Minimal tinggi A4
        width: '100%', // Lebar 100% dari parent
        toolbarSticky: false, // Toolbar tidak lengket
        iframe: false, // Set ke false untuk menghindari masalah styling iframe
        // Tambahkan konfigurasi lain sesuai kebutuhan Jodit
    };

    return (
        <DefaultLayout>
            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Editor Template Surat</h1>

                {/* Editor */}
                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Edit Template Surat</h2>
                    <div className="a4-page-editor-wrapper relative overflow-hidden rounded-md shadow-inner">
                        <JoditEditor
                            ref={editor}
                            value={template}
                            config={joditConfig}
                            onBlur={(newContent) => setTemplate(newContent)}
                        />
                        <div className="absolute inset-0 border-4 border-dashed border-blue-200 pointer-events-none rounded-md"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Ukuran editor ini disesuaikan agar menyerupai halaman A4.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Isi Data Surat</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['nama', 'kelas', 'alasan', 'tanggal'].map((field) => (
                            <div key={field}>
                                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                    {field}:
                                </label>
                                <input
                                    id={field}
                                    type="text"
                                    className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                    placeholder={`Masukkan ${field}`}
                                    value={(formData as any)[field]}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleGenerate}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                    >
                        Tampilkan Pratinjau
                    </button>
                </div>

                {filledTemplate && (
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Pratinjau Dokumen A4 Otomatis</h2>

                        {isMultiPage && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md" role="alert">
                                <p className="font-bold">Perhatian:</p>
                                <p>Konten ini melebihi satu halaman A4 dan akan terbagi menjadi beberapa halaman saat diunduh sebagai PDF.</p>
                            </div>
                        )}

                        {/* Pratinjau A4 yang terlihat */}
                        <div
                            ref={printRef}
                            className="a4-page-preview mx-auto bg-white text-black shadow-lg rounded-md overflow-hidden"
                            style={{
                                width: '210mm',
                                minHeight: '297mm', // Gunakan minHeight agar bisa memanjang
                                padding: '20mm',
                                boxSizing: 'border-box',
                                fontFamily: 'Times New Roman, serif',
                                lineHeight: '1.5',
                                fontSize: '12pt',
                                border: '1px solid #ddd',
                            }}
                            dangerouslySetInnerHTML={{ __html: filledTemplate }}
                        />

                        {/* Div tersembunyi untuk pengukuran tinggi konten */}
                        <div
                            ref={measurementRef}
                            className="a4-page-preview-hidden"
                            style={{
                                position: 'absolute',
                                left: '-9999px', // Sembunyikan dari tampilan
                                top: '-9999px',
                                width: '210mm',
                                minHeight: '297mm',
                                padding: '20mm',
                                boxSizing: 'border-box',
                                fontFamily: 'Times New Roman, serif',
                                lineHeight: '1.5',
                                fontSize: '12pt',
                                overflow: 'hidden', // Penting agar scrollHeight akurat
                                visibility: 'hidden', // Sembunyikan tapi tetap render
                                height: 'auto', // Biarkan tingginya menyesuaikan konten
                            }}
                            dangerouslySetInnerHTML={{ __html: filledTemplate }}
                        />

                        <button
                            onClick={handleDownloadPDF}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        >
                            Unduh PDF
                        </button>
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
}

export default Page;