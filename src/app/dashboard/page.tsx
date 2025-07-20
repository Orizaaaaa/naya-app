'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { MdOutlineMessage } from 'react-icons/md'
import { users } from '@/utils/font'
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    getKeyValue,
    Button,
    Autocomplete,
    AutocompleteItem,
    useDisclosure,
} from "@heroui/react";
import { FaSquarePen } from 'react-icons/fa6'
import CardBar from '@/components/fragments/cardBox/CardBar'
import { IoSearch } from 'react-icons/io5'
import ModalDefault from '@/components/fragments/modal/modal'
import { deleteRequest, getAllRequestMessage, getAllTemplate, updateRequestUser } from '@/api/method'
import { formatTanggalToIndo, getStatusColor } from '@/utils/helper'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import toast from 'react-hot-toast'
import axios from 'axios'

type Props = {}

const page = (props: Props) => {
    const [id, setId] = React.useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
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
        user_id: "",
        email: "",
    });


    const filteredData = React.useMemo(() => {
        return data.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const pages = Math.ceil(filteredData.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, page]);




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
            user_id: item.user.id,
            email: item.user.email
        });
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan perubahan...');

        try {
            const result = await updateRequestUser(form._id, form);

            if (result) {
                // ✅ Siapkan isi email berdasarkan status
                let subject = 'Status Permintaan Surat Anda';
                let text = '';

                if (form.status === 'Selesai') {
                    text = `Halo ${form.title},\n\nPermintaan surat Anda telah selesai diproses.\nSilakan unduh surat Anda melalui link berikut:\n\nhttps://naya-app-pearl.vercel.app/user_page/${form._id}\n\nTerima kasih.`;
                } else {
                    text = `Halo ${form.title},\n\nStatus permintaan surat Anda telah berubah menjadi: ${form.status}`;
                }

                // ✅ Kirim email jika form.email tersedia
                if (form.email) {
                    try {
                        await axios.post('/api/send-email', {
                            to: form.email,
                            subject,
                            text,
                        });
                    } catch (emailError: any) {
                        console.error('❌ Gagal mengirim email:', emailError.response?.data || emailError);
                        toast.error('Data diperbarui, tapi gagal kirim email.', { id: toastId });
                        return;
                    }
                }

                toast.success('Data berhasil diperbarui!', { id: toastId });
                fetchData();
                onClose();
            } else {
                toast.error('Gagal memperbarui data.', { id: toastId });
            }
        } catch (error) {
            console.error('❌ Update error:', error);
            toast.error('Terjadi kesalahan saat memperbarui.', { id: toastId });
        }
    };



    const openModalDelete = (item: any) => {
        setId(item.id);
        onWarningOpen();
    }
    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus surat...');

        try {
            const result = await deleteRequest(id);

            if (result) {
                toast.success('Surat berhasil dihapus!', { id: toastId });
                fetchData();
                onWarningClose();
            } else {
                toast.error('Gagal menghapus surat.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat menghapus.', { id: toastId });
        }
    };


    const jumlahSurat = templates.length.toString(); // Mengubah menjadi string
    const suratBelumDisetujui = data.filter((item) => item.status !== 'Selesai').length.toString(); // Mengubah menjadi string
    const siswaSelesai = data.filter((item) => item.status === 'Selesai').length.toString(); // Mengubah menjadi string

    console.log("data request", data);
    console.log("data form", form);


    const rounded = (value: number, decimals: number = 2): number => {
        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor;
    };



    ; // hasil: 0.09




    return (
        <DefaultLayout>

            {/* Kiri - besar */}
            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <CardBar className='bg-blue-500' text='Jumlah Surat' value={jumlahSurat} icon={<MdOutlineMessage size={20} color="white" />} />
                    <CardBar className='bg-secondBlack' text='Surat yang harus di setujui' value={suratBelumDisetujui} icon={<FaSquarePen size={20} color="white" />} />
                    <CardBar className='bg-[#7828c7]' text='Siswa yang sudah di atasi' value={siswaSelesai} icon={<MdOutlineMessage size={20} color="white" />} />
                </div>


                <h1 className='mt-16 text-white text-2xl mb-3 ' >PERMINTAAN SURAT SISWA</h1>
                <div className="flex w-full px-3 py-2 items-center gap-3 rounded-lg shadow-lg shadow-black/30 my-4 border-2 border-grayCustom" >
                    <IoSearch color="#2c80fd" size={20} />
                    <input
                        placeholder="SEARCH"
                        className=" border-none w-full text-white placeholder-gray-500 outline-none focus:ring-0 bg-transparent"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                </div>
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
                        <TableColumn key="score">SCORE</TableColumn>
                        <TableColumn key="action">ACTION</TableColumn>

                    </TableHeader>
                    <TableBody items={items}>
                        {(item: any) => (
                            <TableRow key={item._id}>
                                {(columnKey) => (
                                    <TableCell>
                                        {columnKey === 'action' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModalSend(item)}
                                                    className="bg-blue-900 text-white cursor-pointer px-3 py-2 rounded-lg text-sm"
                                                >
                                                    MANAGE
                                                </button>
                                                <button
                                                    onClick={() => openModalDelete(item)}
                                                    className="bg-red-800 text-white cursor-pointer px-3 py-2 rounded-lg text-sm"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        ) : columnKey === 'score' ? (
                                            <p>{rounded(Number(getKeyValue(item, columnKey)), 2)}</p>
                                        ) : columnKey === 'status' ? (
                                            <p className={`${getStatusColor(item.status)}`}>{item.status}</p>
                                        )
                                            : (
                                                getKeyValue(item, columnKey)
                                            )}

                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>


            <ModalDefault className="bg-secondBlack p-6 rounded-xl shadow-xl" isOpen={isOpen} onClose={onClose}>
                <form onSubmit={handleUpdate} className="text-white space-y-6">
                    <h1 className="text-2xl font-bold text-center border-b border-white/10 pb-4">
                        📩 Permintaan Surat
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm text-white/60">Nama Surat</p>
                            <p className="text-lg font-semibold">{form.title}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-white/60">Tipe Surat</p>
                            <p className="text-lg font-semibold">{form.type}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-white/60">Tanggal Dibutuhkan</p>
                            <p className="text-lg font-semibold">{formatTanggalToIndo(form.date)}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-white/60">Status Saat Ini</p>
                            <p className="text-lg font-semibold">{form.status}</p>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <p className="text-sm text-white/60">Deskripsi Siswa</p>
                            <p className="text-base">{form.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                            <label className="block text-sm mb-2 text-white/70">🔖 Pilih Jenis Surat</label>
                            <Autocomplete
                                className="max-w-xs"
                                onSelectionChange={(e: any) => onSelectionChange(e)}
                                value={form.type}
                            >
                                {templates.map((item) => (
                                    <AutocompleteItem key={item.body}>{item.name}</AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-white/70">📌 Ubah Status Surat</label>
                            <Autocomplete
                                className="max-w-xs"
                                onSelectionChange={(e: any) => onSelectionChangeStatus(e)}
                                value={form.status}
                                selectedKey={form.status}
                            >
                                {dataStatus.map((item) => (
                                    <AutocompleteItem key={item.key}>{item.value}</AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-10">
                        <button
                            type="submit"
                            className="bg-blue-700 hover:bg-blue-800 transition px-4 py-2 rounded-lg text-white text-sm shadow"
                        >
                            ✅ KIRIM
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-red-700 hover:bg-red-800 transition px-4 py-2 rounded-lg text-white text-sm shadow"
                        >
                            ❌ BATAL
                        </button>
                    </div>
                </form>
            </ModalDefault>


            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                apakah anda yakin akan menghapus surat ini ?
                <div className="flex justify-end gap-3">
                    <button className='bg-red-900  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={onWarningClose}>Tidak</button>
                    <button className='bg-blue-500  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={handleDelete} >Ya</button>
                </div>
            </ModalAlert>


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



        </DefaultLayout >
    )
}

export default page