'use client';

import { getAllRequestMessage } from '@/api/method';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useRef, useState } from 'react';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
const Page = () => {
    const [data, setData] = React.useState<any[]>([]);
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 4;

    // Hitung total halaman berdasarkan data yang sudah diformat
    const pages = Math.ceil((data?.length ?? 0) / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage
        const end = start + rowsPerPage
        return data?.slice(start, end)
    }, [page, data])


    const fetchData = async () => {
        try {
            const res: any = await getAllRequestMessage();
            console.log('databis', res);
            const formatted = res?.data?.map((item: any) => ({
                ...item,
                name: item?.user?.name || '-',
                email: item?.user?.email || '-',
                formatted_date: new Date(item.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }),
            }));
            setData(formatted);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    const printRef = useRef<HTMLDivElement>(null);       // Untuk PDF preview
    const measurementRef = useRef<HTMLDivElement>(null); // Untuk pengukuran tinggi konten

    const [form, setForm] = useState({
        title: "",
        type: "",
        user: {
            name: "",
            email: "",
            id: ""
        },
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
                    Jalan Terusan Taman Kopo Indah III - Mekarrahayu Telp. 022-54438236 Kec. Margaasih Kab. Bandung 40218<br>
                    Website:
                    <a href="http://www.sman1-margaasih.sch.id" style="color: blue;">www.sman1-margaasih.sch.id</a>
                    Email:
                    <a href="mailto:sman_1_margaasih@gmail.com" style="color: blue;">sman_1_margaasih@gmail.com</a>
                    </p>
                </div>
            </div> 
        <p>halo nama saya adalah {name}</p><p>email saya adalah {email}</p>
        `,
        description: "",
        status: "menunggu",
        user_id: "",
    });


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

    const generateDataDownload = async (item: any) => {
        const updatedUser = {
            name: item.user?.name || '',
            email: item.user?.email || '',
            id: item.user?._id || '',
        };

        // 1. Update state form dengan data user
        const updatedForm = {
            ...form,
            user: updatedUser,
        };
        setForm(updatedForm);

        // 2. Generate isi HTML
        const fullHtmlTemplate = `
        <div style="position: relative; min-height: 297mm;">
            ${form.body}
            ${fixedFooterTemplate}
        </div>
    `;

        const result = generateFromTemplate(fullHtmlTemplate, updatedUser);
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

    console.log('form', form);

    const itemsDropdown = [
        {
            key: "new",
            label: "New file",
        },
        {
            key: "copy",
            label: "Copy link",
        },
        {
            key: "edit",
            label: "Edit file",
        },
        {
            key: "delete",
            label: "Delete file",
        },
    ];


    return (
        <DefaultLayout>
            <h1 className="mt-2 text-white text-2xl mb-3">Permintaan surat siswa</h1>
            <Table
                aria-label="Daftar Permintaan Surat"
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="secondary"
                            page={page}
                            total={pages}
                            onChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                }
                classNames={{
                    th: 'text-white bg-black',
                    wrapper: 'min-h-[222px] bg-[#16181a] text-white',
                }}
            >
                <TableHeader>
                    <TableColumn key="name">NAME</TableColumn>
                    <TableColumn key="type">TIPE SURAT</TableColumn>
                    <TableColumn key="title">JUDUL SURAT</TableColumn>
                    <TableColumn key="formatted_date">TANGGAL</TableColumn>
                    <TableColumn key="generate">GENERATE</TableColumn>
                    <TableColumn key="status">STATUS</TableColumn>
                    <TableColumn key="action">ACTION</TableColumn>

                </TableHeader>
                <TableBody items={items}>
                    {(item: any) => (
                        <TableRow key={item._id}>
                            {(columnKey) => (
                                <TableCell>
                                    {columnKey === 'action' ? (
                                        <div className="flex gap-2">
                                            <button className="bg-blue-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                                                Edit
                                            </button>
                                            <button className="bg-red-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-red-700 transition">
                                                Delete
                                            </button>
                                        </div>
                                    ) : columnKey === 'generate' ?
                                        (
                                            <Dropdown>
                                                <DropdownTrigger>
                                                    <button className='bg-blue-800 text-white cursor-pointer px-3 py-1 rounded text-sm hover:bg-blue-700 transition' >Pilih Surat</button>
                                                </DropdownTrigger>
                                                <DropdownMenu aria-label="Dynamic Actions" items={itemsDropdown}>
                                                    {(item) => (
                                                        <DropdownItem
                                                            key={item.key}
                                                            className={item.key === "delete" ? "text-danger" : ""}
                                                            color={item.key === "delete" ? "danger" : "default"}
                                                        >
                                                            {item.label}
                                                        </DropdownItem>
                                                    )}
                                                </DropdownMenu>
                                            </Dropdown>
                                        ) :
                                        (
                                            getKeyValue(item, columnKey)
                                        )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>


            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                {filledTemplate && (
                    <>
                        {/* Pratinjau A4 yang terlihat */}
                        <div
                            ref={printRef}
                            className="a4-page-preview mx-auto bg-white text-black shadow-lg rounded-md overflow-hidden"
                            style={{
                                position: 'relative',
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
        </DefaultLayout>
    );
};

export default Page;
