'use client';

import { getAllRequestMessage, getAllTemplate, updateRequestUser } from '@/api/method';
import ModalDefault from '@/components/fragments/modal/modal';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { formatDate, formatTanggalToIndo } from '@/utils/helper';
import { Autocomplete, AutocompleteItem, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from '@heroui/react';
import { log } from 'console';
import { i } from 'framer-motion/client';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useRef, useState } from 'react';
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
const Page = () => {
    const { onOpen, onClose, isOpen } = useDisclosure();
    const printRef = useRef<HTMLDivElement>(null);       // Untuk PDF preview
    const measurementRef = useRef<HTMLDivElement>(null); // Untuk pengukuran tinggi konten
    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const [isMultiPage, setIsMultiPage] = useState<boolean>(false);
    const [data, setData] = React.useState<any[]>([]);
    const [templates, setTemplate] = useState<any[]>([])
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 4;
    const [form, setForm] = useState({
        _id: "",
        title: "",
        type: "",
        body: "",
        description: "",
        date: "",
        status: "",
        user_id: ""
    });


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


    const fetchDatTemplate = async () => {
        try {
            const res: any = await getAllTemplate();
            setTemplate(res.data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    useEffect(() => {
        fetchDatTemplate();
        fetchData();
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

    // yang ini yang untuk download asli
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


    const dataStatus = [
        { key: "Diproses", label: "Diproses", value: "Diproses" },
        { key: "Menunggu", label: "Menunggu", value: "Menunggu" },
        { key: "Selesai", label: "Selesai", value: "Selesai" },
        { key: "Ditolak", label: "Ditolak", value: "Ditolak" },
    ];


    const onSelectionChange = (body: string) => {
        console.log('body', body);
        setForm({
            ...form,
            body: body
        });
    };
    const onSelectionChangeStatus = (status: string) => {
        console.log('status', status);
        setForm({
            ...form,
            status: status
        });
    };

    const openModalSend = (item: any) => {
        onOpen();
        setForm({
            ...form,
            _id: item.id,
            title: item.title,
            type: item.type,
            body: item.body,
            description: item.description,
            date: item.date,
            status: item.status,
            user_id: item.user.id

        });
    }

    const handleUpdate = async (e: any) => {
        e.preventDefault();
        console.log('kunyuk', form);
        await updateRequestUser(form._id, form).then((result) => {
            if (result) {
                fetchData();
                onClose();
            }
        })
    }
    console.log("data request", data);
    console.log("data form", form);


    return (
        <DefaultLayout>
            <h1 className="mt-2 text-white text-2xl mb-3">PERMINTAAN SURAT SISWA</h1>
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
                                            <button onClick={() => openModalSend(item)} className="bg-blue-900 text-white cursor-pointer px-3 py-2 rounded-lg text-sm ">
                                                KIRIM SURAT
                                            </button>
                                            <button className="bg-red-800 text-white cursor-pointer px-3 py-2 rounded-lg text-sm  ">
                                                DELETE
                                            </button>
                                        </div>
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

            <ModalDefault className='bg-secondBlack' isOpen={isOpen} onClose={onClose} >
                <form onSubmit={handleUpdate} className='text-white'>
                    <h1 className='mb-12 ' >KIRIM SURAT</h1>
                    <div className="space-y-3">
                        <h2>Meminta Surat Bernama : {form.title}</h2>
                        <h2>Dengan Tipe Surat : {form.type}</h2>
                        <h2>Dengan Tanggal : {formatTanggalToIndo(form.date)}</h2>
                        <h2>Status saat ini : {form.status}</h2>
                        <div >
                            <h1 className='mb-2' >Berikan Jenis Surat</h1>
                            <Autocomplete className="max-w-xs" onSelectionChange={(e: any) => onSelectionChange(e)} value={form.type}>
                                {templates.map((item) => (
                                    <AutocompleteItem key={item.body}>{item.name}</AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>
                        <div >
                            <h1 className='mb-2' >Masukan Status Surat</h1>
                            <Autocomplete className="max-w-xs" onSelectionChange={(e: any) => onSelectionChangeStatus(e)} value={form.status} selectedKey={form.status}>
                                {dataStatus.map((item) => (
                                    <AutocompleteItem key={item.key}>{item.value}</AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-12">
                        <button
                            type='submit'
                            className="bg-blue-900 text-white cursor-pointer px-3 py-2 rounded-lg text-sm "
                        >
                            KIRIM
                        </button>
                        <button
                            className="bg-red-800 text-white cursor-pointer px-3 py-2 rounded-lg text-sm "
                            onClick={onClose}
                        >
                            BATAL
                        </button>
                    </div>
                </form>
            </ModalDefault>


            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                {filledTemplate && (
                    <>
                        {/* Pratinjau A4 yang terlihat */}
                        <div
                            ref={printRef}
                            className="a4-page-preview mx-auto bg-white text-black shadow-lg rounded-lg-md overflow-hidden"
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
