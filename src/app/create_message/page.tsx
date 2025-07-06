'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import html2pdf from 'html2pdf.js';
import DefaultLayout from '@/components/layouts/DefaultLayout';

// Asumsi DefaultLayout adalah komponen layout dasar Anda.
// Jika Anda tidak memiliki komponen ini, Anda bisa menggantinya dengan div kosong atau menyesuaikan sesuai kebutuhan.


// Dynamic import JoditEditor untuk memastikan hanya di-render di sisi klien
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

function Page() {
    const editor = useRef(null);
    const printRef = useRef<HTMLDivElement>(null); // Ref untuk div pratinjau A4
    const measurementRef = useRef<HTMLDivElement>(null); // Ref untuk div pengukuran tersembunyi

    // Bagian template yang TIDAK akan diedit oleh Jodit Editor
    const fixedFooterTemplate = `
    <!-- Tanda Tangan -->
    <div style="margin-top: 50px; text-align: right;">
        <p style="margin-bottom: 0; line-height: 1.5;">Hormat kami,</p>
        <p style="margin-top: 0; margin-bottom: 0; line-height: 1.5;">(Nama Penanda Tangan)</p>
        <img src="{signatureImageUrl}" alt="Tanda Tangan" style="width: 150px; height: auto; display: block; margin-left: auto; margin-right: 0; margin-top: 10px; margin-bottom: 5px; object-fit: contain;" onerror="this.style.display='none';">
    </div>
    `;

    // Konten yang akan diedit di Jodit Editor
    const [editableContent, setEditableContent] = useState<string>(`
    <p style="margin-bottom: 0; line-height: 1.5;">
      Ini adalah paragraf contoh untuk menguji tampilan multi-halaman. Anda bisa menambahkan lebih banyak teks di sini untuk melihat bagaimana halaman akan terbagi secara otomatis. Pastikan untuk mengisi formulir di bawah ini untuk melihat pratinjau yang terisi.
    </p>
    <p style="margin-bottom: 0; line-height: 1.5;">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p style="margin-bottom: 0; line-height: 1.5;">
      Curabitur pretium tincidunt lacus. Nulla facilisi. Aliquam erat volutpat. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper et, sollicitudin eu, nulla. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui ligula, fringilla a, euismod sodales, sollicitudin vel, wisi. Morbi auctor lorem non est.
    </p>
    <p style="margin-bottom: 0; line-height: 1.5;">
      Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et ipsum sagittis fermentum. Ut ac quam. Nunc eget est. Phasellus et lorem. Vivamus sollicitudin.
    </p>
    `);

    const [formData, setFormData] = useState({
        nama: 'Budi Santoso',
        kelas: 'XII IPA 1',
        alasan: 'Sakit',
        tanggal: '06 Juli 2025',
        orizaSativaImageUrl: 'https://placehold.co/500x300/F0F0F0/000000?text=Oriza+Sativa', // Placeholder image
        signatureImageUrl: '', // Default kosong, akan diisi dari file lokal
    });

    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const [isMultiPage, setIsMultiPage] = useState<boolean>(false);

    // Fungsi untuk mengisi template dengan data
    const generateFromTemplate = useCallback((templateString: string, data: Record<string, string>) => {
        let result = templateString;
        Object.entries(data).forEach(([key, value]) => {
            // Mengganti placeholder dengan nilai dari formData
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
        // Gabungkan bagian template yang tetap dengan konten yang diedit
        const fullHtmlTemplate = `
            <div style="position: relative; min-height: 297mm;">
             
                ${editableContent}
                ${fixedFooterTemplate}
            </div>
        `;
        const result = generateFromTemplate(fullHtmlTemplate, formData);
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
                image: { type: 'png', quality: 0.98 }, // Mengubah type dari jpeg ke png
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

    // Fungsi untuk menangani perubahan input file tanda tangan
    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Simpan Base64 string ke formData
                setFormData((prev) => ({ ...prev, signatureImageUrl: reader.result as string }));
                console.log("Signature Image Base64 URL:", reader.result); // Debugging log
            };
            reader.readAsDataURL(file); // Baca file sebagai Data URL (Base64)
        } else {
            setFormData((prev) => ({ ...prev, signatureImageUrl: '' })); // Kosongkan jika tidak ada file
        }
    };

    // Konfigurasi Jodit Editor
    const joditConfig = {
        readonly: false, // false untuk mode edit
        height: 'auto', // Tinggi otomatis, akan menyesuaikan dengan konten
        minHeight: '297mm', // Minimal tinggi A4
        width: '100%', // Lebar 100% dari parent
        toolbarSticky: false, // Toolbar tidak lengket
        iframe: false, // Set ke false untuk menghindari masalah styling iframe
        // Memungkinkan penyisipan gambar melalui URL atau base64
        buttons: 'bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,lineHeight,paragraph,align,|,image,link,table,code,selectall,cut,copy,paste',
        extraButtons: ['image'], // Pastikan tombol image ada
        image: {
            openOnDblClick: true, // Buka dialog edit gambar saat double click
            // Konfigurasi upload gambar (jika ada backend)
            uploader: {
                insertImageAsBase64URI: true, // Untuk demo, langsung sisipkan sebagai base64 URI
            },
            // Jika tidak ada uploader, Anda bisa menggunakan dialog untuk URL
            popap: {
                open: 'insertImage',
                elements: [
                    'image',
                    'imageSrc',
                    'imageAlt',
                    'imageSize',
                    'imageMargins',
                    'imageAlign',
                    'imageRemove',
                ],
            },
        },
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
                            value={editableContent} // Menggunakan editableContent sebagai nilai Jodit
                            config={joditConfig}
                            onBlur={(newContent) => setEditableContent(newContent)} // Memperbarui editableContent
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
                        {/* Input untuk URL Gambar Oriza Sativa */}
                        <div>
                            <label htmlFor="orizaSativaImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                URL Gambar Oriza Sativa:
                            </label>
                            <input
                                id="orizaSativaImageUrl"
                                type="text"
                                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                placeholder="Masukkan URL gambar Oriza Sativa"
                                value={formData.orizaSativaImageUrl}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, orizaSativaImageUrl: e.target.value }))
                                }
                            />
                        </div>
                        {/* Input untuk File Gambar Tanda Tangan */}
                        <div>
                            <label htmlFor="signatureImageFile" className="block text-sm font-medium text-gray-700 mb-1">
                                Unggah Gambar Tanda Tangan:
                            </label>
                            <input
                                id="signatureImageFile"
                                type="file"
                                accept="image/*" // Hanya menerima file gambar
                                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={handleSignatureChange}
                            />
                            {formData.signatureImageUrl && (
                                <p className="text-sm text-gray-500 mt-1">Gambar berhasil diunggah.</p>
                            )}
                        </div>
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
                                // border: '1px solid #ddd', // Baris ini dihapus
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