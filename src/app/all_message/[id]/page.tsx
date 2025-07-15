'use client'
import { getTemplateById, updateTemplate } from '@/api/method';
import InputForm from '@/components/elements/input/InputForm';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { Spinner } from '@heroui/react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react'
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
type Props = {}

function page({ }: Props) {
    const [loading, setLoading] = useState(false)
    const editor = useRef(null);
    const printRef = useRef<HTMLDivElement>(null);       // Untuk PDF preview
    const measurementRef = useRef<HTMLDivElement>(null); // Untuk pengukuran tinggi konten
    const [data, setData] = React.useState({});
    const { id }: any = useParams()
    const [form, setForm] = React.useState({
        name: "",
        type: "",
        body: ``,
    });
    const fetchData = async () => {
        setLoading(true)
        try {
            const result = await getTemplateById(id); // ✅ terima data langsung
            setData(result.data); // ✅ langsung set data
            setForm({
                name: result.data.name,
                type: result.data.type,
                body: result.data.body
            });
            setLoading(false)
        } catch (error) {
            console.error('Gagal fetch data:', error);
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


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
        const result = generateFromTemplate(fullHtmlTemplate, data);
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
    const handleUpdate = async () => {
        console.log('kunyuk', form);
        updateTemplate(id, form).then((result) => {
            if (result) {
                router.push('/all_message');
            }
        })
    }

    console.log('kunyuk', data);
    console.log('kunyuk2', form);
    return (
        <DefaultLayout>
            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-extrabold text-white mb-6 text-center">DETAIL TEMPLATE SURAT</h1>
                {!loading ? (
                    <>
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
                                onClick={handleUpdate}
                                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                            >
                                Update
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
                    </>
                ) : (
                    <div className="flex justify-center ">
                        <Spinner className="w-5 h-5" size="sm" color="white" />
                    </div>


                )}

            </div>

        </DefaultLayout>
    )
}

export default page