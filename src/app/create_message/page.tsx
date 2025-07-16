'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import InputForm from '@/components/elements/input/InputForm';
import { Autocomplete, AutocompleteItem, DatePicker } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { formatDate } from '@/utils/helper';
import { createMessageTemplate } from '@/api/method';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';


// Asumsi DefaultLayout adalah komponen layout dasar Anda.
// Jika Anda tidak memiliki komponen ini, Anda bisa menggantinya dengan div kosong atau menyesuaikan sesuai kebutuhan.


// Dynamic import JoditEditor untuk memastikan hanya di-render di sisi klien
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

function Page() {
    // ========================
    // STATE & REFS
    // ========================
    const dateNow = new Date();
    const editor = useRef(null);
    const printRef = useRef<HTMLDivElement>(null);       // Untuk PDF preview
    const measurementRef = useRef<HTMLDivElement>(null); // Untuk pengukuran tinggi konten

    const [form, setForm] = useState({
        name: "",
        type: "",
        body: `
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
    `,
    });

    const dataSiswa = {
        name: "",
        email: "",
        password: "",
        address: "",
        phone: "",
        birthdate: "",
        place_of_birth: "",
        image: "",
        gender: "",
        class_name: "",
        role: "",
        nisn: "",
        nis: ""
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const [isMultiPage, setIsMultiPage] = useState<boolean>(false);

    // ========================
    // TEMPLATE FIXED FOOTER
    // ========================
    const fixedFooterTemplate = `
    <div style="margin-top: 50px; text-align: right;">
      <p style="margin-bottom: 0; line-height: 1.5;">Bandung, {tanggal}</p>
      <p style="margin-bottom: 0; line-height: 1.5;">Kepala Sekolah,</p>
      <img src="{signatureImageUrl}" alt="Tanda Tangan" style="width: 100px; height: 100px; display: block; margin-left: auto; margin-right: 0; margin-top: 10px; margin-bottom: 5px; object-fit: contain;" onerror="this.style.display='none';">
      <p style="margin-bottom: 0; line-height: 1.5;">Toteng Suhara, S.Pd., M.M.Pd</p>
      <p style="margin-bottom: 0; line-height: 1.5;">NIP. 197007202005011008</p>
    </div>
  `;

    // ========================
    // EFFECT: CEK MULTI HALAMAN
    // ========================
    useEffect(() => {
        if (filledTemplate && measurementRef.current) {
            const timeoutId = setTimeout(() => {
                const contentHeight = measurementRef.current?.scrollHeight || 0;
                const a4HeightInPx = measurementRef.current?.offsetHeight || 0;
                const tolerance = 5;

                setIsMultiPage(contentHeight > a4HeightInPx + tolerance);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [filledTemplate]);

    // ========================
    // FUNCTION: GENERATE TEMPLATE
    // ========================
    const generateFromTemplate = useCallback(
        (templateString: string, data: Record<string, string>) => {
            let result = templateString;
            Object.entries(data).forEach(([key, value]) => {
                result = result.replace(new RegExp(`{${key}}`, 'g'), value);
            });
            return result;
        },
        []
    );

    const handleGenerate = () => {
        const fullHtmlTemplate = `
      <div style="position: relative; min-height: 297mm;">
        ${form.body}
        ${fixedFooterTemplate}
      </div>
    `;
        const result = generateFromTemplate(fullHtmlTemplate, dataSiswa);
        setFilledTemplate(result);
    };

    // ========================
    // FUNCTION: DOWNLOAD PDF
    // ========================
    const handleDownloadPDF = async () => {
        if (!printRef.current) {
            console.error("Print reference is not available.");
            return;
        }

        const html2pdf = (await import('html2pdf.js')).default;
        const previewWidth = printRef.current.offsetWidth;

        html2pdf()
            .set({
                margin: [3, 3, 3, 3],
                filename: 'surat-multi-halaman.pdf',
                image: { type: 'png', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    width: previewWidth,
                    windowWidth: previewWidth,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    x: 3,
                    y: 3,
                },
                width: 170,
            })
            .from(printRef.current)
            .save();
    };

    // ========================
    // JODIT CONFIG
    // ========================
    const joditConfig = {
        readonly: false,
        height: 'auto',
        minHeight: '297mm',
        width: '100%',
        toolbarSticky: false,
        iframe: false,
        buttons:
            'bold,italic,underline,strikethrough,|,ul,ol,|,font,fontsize,lineHeight,paragraph,align,|,image,link,table,code,selectall,cut,copy,paste',
        extraButtons: ['image'],
        image: {
            openOnDblClick: true,
            uploader: {
                insertImageAsBase64URI: true,
            },
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

    const router = useRouter();
    const handleCreate = async () => {
        // Validasi semua field wajib diisi
        if (!form.name || !form.type || !form.body.trim()) {
            toast.error("Semua data wajib diisi!");
            return;
        }

        const toastId = toast.loading("Membuat template surat...");

        try {
            await createMessageTemplate(form, (result: any) => {
                if (result) {
                    toast.success("Template berhasil dibuat!", { id: toastId });
                    router.push("/all_message");
                } else {
                    toast.error("Gagal membuat template.", { id: toastId });
                }
            });
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan server.", { id: toastId });
        }
    };


    return (
        <DefaultLayout>
            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-white mb-6 text-center">EDITOR TEMPLATE SURAT</h1>
                <div className="grid grid-cols-2 gap-3 w-full ">
                    <InputForm
                        className="bg-white "
                        placeholder="Masukkan Nama Surat"
                        type="name"
                        htmlFor="name"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <InputForm
                        className="bg-white "
                        placeholder="Masukkan Tipe"
                        type="text"
                        htmlFor="type"
                        value={form.type}
                        onChange={handleChange}
                    />
                </div>


                {/* Editor */}
                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                    <div className="a4-page-editor-wrapper relative overflow-hidden rounded-md shadow-inner">
                        <JoditEditor
                            ref={editor}
                            value={form.body} // Menggunakan editableContent sebagai nilai Jodit
                            config={joditConfig}
                            onBlur={(e) => setForm({ ...form, body: e })} // Memperbarui editableContent
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
                        onClick={handleCreate}
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