'use client'
import { getMessageUser } from '@/api/method'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MdDownloading } from 'react-icons/md'

type Props = {}

const page = (props: Props) => {
    const printRef = useRef<HTMLDivElement>(null);
    const id = '68713d761f1a92d8a4285489'
    const measurementRef = useRef<HTMLDivElement>(null); // Untuk pengukuran tinggi konten
    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const [isMultiPage, setIsMultiPage] = useState<boolean>(false);
    const [form, setForm]: any = useState({
        title: "",
        description: "",
        type: "",
        status: "",
        date: "", // atau new Date() jika kamu pakai Date Picker
        body: "",
        user: {
            id: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            birthdate: "", // atau new Date() jika perlu format Date
            class_name: "",
            gender: "",
            image: "",
            nis: "",
            nisn: "",
            place_of_birth: "",
        },
    });


    const fetchDataMessage = async (id: string) => {
        try {
            const res: any = await getMessageUser(id);
            setForm(res.data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    useEffect(() => {
        fetchDataMessage(id);
    }, []);

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


    // ========================
    // FUNCTION: DOWNLOAD PDF
    // ========================

    // yang ini yang untuk download asli
    const generateDataDownload = async (item: any) => {
        // 2. Generate isi HTML
        const fullHtmlTemplate = `
            <div style="position: relative; min-height: 297mm;">
                ${form.body}
                ${fixedFooterTemplate}
            </div>
        `;

        const result = generateFromTemplate(fullHtmlTemplate, form.user);
        setFilledTemplate(result);

        // 4. Lanjut download PDF
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



    console.log(form);

    return (
        <div className="bg-black h-screen flex items-center justify-center">
            <button onClick={() => generateDataDownload(form)} className="bg-primary text-white px-5 py-2 rounded-lg flex gap-3 justify-center items-center cursor-pointer">
                DOWNLOAD
                <MdDownloading size={25} color="white" />
            </button>
            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                {filledTemplate && (
                    <>
                        {/* Pratinjau A4 yang terlihat */}
                        <div
                            ref={printRef}
                            className="a4-page-preview mx-auto bg-white text-black shadow-lg rounded-lg-md overflow-hidden"
                            style={{
                                position: 'absolute',
                                zIndex: -9999, // paling bawah
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
                    </>

                )}
            </div>
        </div>

    )
}

export default page