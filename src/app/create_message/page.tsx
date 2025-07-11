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
        <p style="margin-bottom: 0; line-height: 1.5;">Bandung, {tanggal}</p>
        <p style="margin-bottom: 0; line-height: 1.5;">Kepala Sekolah,</p>
        <img src="{signatureImageUrl}" alt="Tanda Tangan" style="width: 100px; height: 100px; display: block; margin-left: auto; margin-right: 0; margin-top: 10px; margin-bottom: 5px; object-fit: contain;" onerror="this.style.display='none';">
        <p style="margin-bottom: 0; line-height: 1.5;">Toteng Suhara, S.Pd., M.M.Pd </p>
        <p style="margin-bottom: 0; line-height: 1.5;">NIP. 197007202005011008</p>
    </div>
    `;

    // Konten yang akan diedit di Jodit Editor
    const [editableContent, setEditableContent] = useState<string>(`

            <div style="position: relative; border-bottom: 3px double black; padding-bottom: 10px; margin-bottom: 20px; min-height: 100px;">
            <img src="/sekolah_logo.png" alt="logo" style="position: absolute; top: 0; left: 0; width: 100px; height: 100px;">
            <div style="text-align: center;">
                <h3 style="margin: 5px 0;"><span style="font-size: 18px;"><strong>PEMERINTAH DAERAH PROVINSI JAWA BARAT</strong></span></h3>
                <h3 style="margin: 5px 0;"><span style="font-size: 18px;"><strong>DINAS PENDIDIKAN</strong></span></h3>
                <h2 style="margin: 10px 0; font-weight: bold;">
                <span style="font-size: 18px;">CABANG DINAS PENDIDIKAN WILAYAH VIII<br>
                SMA NEGERI 1 MARGAASIH</span>
                </h2>
            <p style="margin: 5px 0; font-size: 14px;">
                Jalan Terusan Taman Kopo Indah III - Mekarrahayu Telp. 022-54438236 Kec. Margaasih Kab. Bandung 40218<br />
                Website:
                <a href="http://www.sman1-margaasih.sch.id" style="color: blue;">www.sman1-margaasih.sch.id</a>
                Email:
                <a href="mailto:sman_1_margaasih@gmail.com" style="color: blue;">sman_1_margaasih@gmail.com</a>
                </p>
            </div>
            </div>

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
                margin: [3, 3, 3, 3], // Margin atas, kiri, bawah, kanan (sesuai padding A4)
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
                    // 3mm adalah margin kiri dan atas
                    x: 3,
                    y: 3,
                },
                // Menambahkan 'width' untuk secara eksplisit menentukan lebar area konten untuk rendering
                // Lebar A4 (210mm) dikurangi margin kiri dan kanan (2 * 20mm) = 170mm
                width: 170,
            })
            .from(printRef.current)
            .save();
    };

    // Fungsi untuk menangani perubahan input file tanda tangan


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

    console.log(editableContent);

    return (
        <DefaultLayout>
            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-white mb-6 text-center">EDITOR TEMPLATE SURAT</h1>

                {/* Editor */}
                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
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

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleGenerate}
                        className="mt-6 w-full bg-yellow-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                    >
                        Tampilkan Pratinjau
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                    >
                        Simpan
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