'use client'
import { getMessageUser } from '@/api/method'
import { Spinner } from '@heroui/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MdDownloading } from 'react-icons/md'

type Props = {}

const page = (props: Props) => {
    const id = '68713d761f1a92d8a4285489'
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        // 1. Generate HTML isi
        const fullHtmlTemplate = `
                <div style="position: relative; min-height: 297mm;">
                ${form.body}
                ${fixedFooterTemplate}
                </div>
            `;

        // 2. Gantikan placeholder data
        const result = generateFromTemplate(fullHtmlTemplate, form.user);

        // 3. Buat elemen div virtual (tidak ditampilkan ke halaman)
        const virtualElement = document.createElement('div');
        virtualElement.innerHTML = result;

        // 4. Import html2pdf dan lakukan konversi
        const html2pdf = (await import('html2pdf.js')).default;

        html2pdf()
            .set({
                margin: [10, 10, 10, 10],
                filename: 'surat-permohonan.pdf',
                image: { type: 'png', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                },
            })
            .from(virtualElement) // langsung dari elemen virtual
            .save();

        setLoading(false);
    };




    console.log(form);

    return (
        <div className="bg-black h-screen flex items-center justify-center">
            <button
                onClick={() => generateDataDownload(form)}
                className="bg-primary text-white px-5 py-2 rounded-lg flex gap-3 justify-center items-center cursor-pointer"
            >
                {loading ? (
                    <Spinner className="w-5 h-5" size="sm" color="white" />
                ) : (
                    <>
                        DOWNLOAD
                        <MdDownloading size={20} color="white" />
                    </>
                )}
            </button>

        </div>

    )
}

export default page