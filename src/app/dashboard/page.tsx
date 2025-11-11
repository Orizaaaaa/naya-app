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
    DatePicker,
} from "@heroui/react";
import { FaSquarePen } from 'react-icons/fa6'
import { MdDownload } from 'react-icons/md'
import CardBar from '@/components/fragments/cardBox/CardBar'
import { IoSearch } from 'react-icons/io5'
import ModalDefault from '@/components/fragments/modal/modal'
import { deleteRequest, getAllRequestMessage, getAllTemplate, updateRequestUser, getRequestSummary } from '@/api/method'
import { formatTanggalToIndo, getStatusColor } from '@/utils/helper'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@/hook/AuthContext'
import { parseDate } from '@internationalized/date'
// Import jsPDF and jspdf-autotable
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
// Import recharts for chart visualization
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

type Props = {}

const page = (props: Props) => {
    const { role } = useAuth();
    const [id, setId] = React.useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'Semua' | 'Menunggu'>('Menunggu');
    const [dateFilter, setDateFilter] = useState<any>(null);

    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const { onOpen, onClose, isOpen } = useDisclosure();
    const { isOpen: isExportOpen, onOpen: onExportOpen, onClose: onExportClose } = useDisclosure();
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);       // Untuk PDF preview
    const measurementRef = useRef<HTMLDivElement>(null); // Untuk pengukuran tinggi konten
    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const [isMultiPage, setIsMultiPage] = useState<boolean>(false);
    const [data, setData] = React.useState<any[]>([]);
    const [templates, setTemplate] = useState<any[]>([])
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 4;
    const [summaryData, setSummaryData] = useState<any>(null);
    const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
    const [isLoadingChart, setIsLoadingChart] = useState(false);
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
        return data.filter((item) => {
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
            
            // Filter berdasarkan tanggal jika ada
            let matchDate = true;
            if (dateFilter) {
                const itemDate = new Date(item.date);
                const filterDate = new Date(dateFilter.year, dateFilter.month - 1, dateFilter.day);
                matchDate = itemDate.toDateString() === filterDate.toDateString();
            }
            
            return matchSearch && matchStatus && matchDate;
        });
    }, [data, searchTerm, statusFilter, dateFilter]);


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
            setTemplate(res?.data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    const fetchSummaryData = async (year: number) => {
        setIsLoadingChart(true);
        try {
            const res = await getRequestSummary(year);
            setSummaryData(res);
        } catch (error) {
            console.error('Gagal fetch summary data:', error);
            toast.error('Gagal mengambil data summary untuk chart');
        } finally {
            setIsLoadingChart(false);
        }
    };

    useEffect(() => {
        fetchDatTemplate();
        fetchData();
        fetchSummaryData(chartYear);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (chartYear) {
            fetchSummaryData(chartYear);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartYear]);


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

    const generatePDFTable = (summaryData: any) => {
        console.log('Generating PDF table with data:', summaryData);
        const { year, data: summary } = summaryData;
        
        if (!summary || !Array.isArray(summary)) {
            console.error('Invalid summary data structure:', summary);
            return '<div>Error: Data tidak valid</div>';
        }
        
        let tableHTML = `
            <div style="font-family: 'Times New Roman', serif; padding: 10px 20px; background-color: white; margin: 0;">
                <h1 style="text-align: center; margin: 10px 0 20px 0; font-size: 20px; font-weight: bold; color: #000;">
                    LAPORAN PERMINTAAN SURAT TAHUN ${year}
                </h1>
                <table style="width: 100%; border-collapse: collapse; margin: 0; border: 1px solid #000;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; color: #000; font-size: 11pt;">Bulan</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; color: #000; font-size: 11pt;">Kategori Surat</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; color: #000; font-size: 11pt;">Total Permintaan</th>
                            <th style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; color: #000; font-size: 11pt;">Total Selesai</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        summary.forEach((monthData: any, monthIndex: number) => {
            console.log(`Processing month ${monthIndex + 1}:`, monthData);
            
            if (monthData.categories && Array.isArray(monthData.categories) && monthData.categories.length > 0) {
                monthData.categories.forEach((category: any, index: number) => {
                    const monthCell = index === 0 
                        ? `<td rowspan="${monthData.categories.length}" style="border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; color: #000; font-weight: normal; font-size: 10pt;">${monthData.month_name || 'N/A'}</td>`
                        : '';
                    
                    tableHTML += `
                        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                            ${monthCell}
                            <td style="border: 1px solid #000; padding: 8px; color: #000; font-weight: normal; font-size: 10pt;">${String(category.category_name || 'N/A')}</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-weight: normal; font-size: 10pt;">${String(category.total_request || 0)}</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-weight: normal; font-size: 10pt;">${String(category.total_done || 0)}</td>
                        </tr>
                    `;
                });
            } else {
                tableHTML += `
                    <tr style="background-color: #f9f9f9;">
                        <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #000; font-weight: normal; font-size: 10pt;">${monthData.month_name || 'N/A'}</td>
                        <td style="border: 1px solid #000; padding: 8px; text-align: center; color: #666; font-style: italic; font-size: 10pt;" colspan="3">Tidak ada data</td>
                    </tr>
                `;
            }
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        console.log('Generated table HTML length:', tableHTML.length);
        return tableHTML;
    };

    const handleExportPDF = async () => {
        if (!selectedYear) {
            toast.error('Pilih tahun terlebih dahulu!');
            return;
        }

        setIsGeneratingPDF(true);
        const toastId = toast.loading('Mengambil data dan membuat PDF...');

        try {
            const summaryData = await getRequestSummary(selectedYear);
            console.log('Summary data received:', summaryData);
            
            if (!summaryData || !summaryData.data) {
                console.error('Invalid summary data:', summaryData);
                toast.error('Gagal mengambil data summary.', { id: toastId });
                setIsGeneratingPDF(false);
                return;
            }

            // Create new PDF document
            // jsPDF and jspdf-autotable are already imported at top level
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Add title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(`LAPORAN PERMINTAAN SURAT TAHUN ${summaryData.year}`, 105, 15, { align: 'center' });

            // Prepare table data
            const tableData: any[] = [];
            const { data: summary } = summaryData;

            summary.forEach((monthData: any) => {
                if (monthData.categories && Array.isArray(monthData.categories) && monthData.categories.length > 0) {
                    monthData.categories.forEach((category: any, index: number) => {
                        if (index === 0) {
                            // First row of the month - include month name
                            tableData.push([
                                monthData.month_name || 'N/A',
                                category.category_name || 'N/A',
                                category.total_request || 0,
                                category.total_done || 0,
                            ]);
                        } else {
                            // Subsequent rows - empty month cell for rowspan effect
                            tableData.push([
                                '',
                                category.category_name || 'N/A',
                                category.total_request || 0,
                                category.total_done || 0,
                            ]);
                        }
                    });
                } else {
                    // Month with no categories
                    tableData.push([
                        monthData.month_name || 'N/A',
                        'Tidak ada data',
                        '',
                        '',
                    ]);
                }
            });

            // Add table using jspdf-autotable
            // autoTable is a function, not a method
            autoTable(doc, {
                head: [['Bulan', 'Kategori Surat', 'Total Permintaan', 'Total Selesai']],
                body: tableData,
                startY: 25,
                margin: { top: 20, left: 10, right: 10 },
                styles: {
                    font: 'helvetica',
                    fontSize: 9,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 30 },
                    1: { halign: 'left', cellWidth: 80 },
                    2: { halign: 'center', cellWidth: 35 },
                    3: { halign: 'center', cellWidth: 35 },
                },
                alternateRowStyles: {
                    fillColor: [249, 249, 249],
                },
                didParseCell: (data: any) => {
                    // Handle rowspan for month column - merge empty cells with previous month cell
                    if (data.column.index === 0 && data.cell.text[0] === '') {
                        // Find the previous non-empty cell in the same column
                        let prevRowIndex = data.row.index - 1;
                        while (prevRowIndex >= 0) {
                            const prevCell = data.table.body[prevRowIndex][0];
                            if (prevCell && prevCell !== '') {
                                // Merge this cell with the previous one
                                data.cell.text = [''];
                                return;
                            }
                            prevRowIndex--;
                        }
                    }
                },
            });

            // Save PDF
            doc.save(`Laporan_Permintaan_Surat_${selectedYear}.pdf`);
            
            toast.success('PDF berhasil diunduh!', { id: toastId });
            onExportClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Gagal membuat PDF.', { id: toastId });
        } finally {
            setIsGeneratingPDF(false);
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

    // Process summary data for charts
    const processChartData = () => {
        if (!summaryData || !summaryData.data) return [];

        return summaryData.data.map((monthData: any) => {
            const totalRequest = monthData.categories?.reduce((sum: number, cat: any) => sum + (cat.total_request || 0), 0) || 0;
            const totalDone = monthData.categories?.reduce((sum: number, cat: any) => sum + (cat.total_done || 0), 0) || 0;
            
            return {
                month: monthData.month_name || 'N/A',
                totalRequest,
                totalDone,
                pending: totalRequest - totalDone,
            };
        });
    };

    const chartData = processChartData();

    console.log('tempates', templates);
    console.log('role', role);



    return (
        <DefaultLayout>

            {/* Kiri - besar */}
            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <CardBar className='bg-blue-500' text='Jumlah Surat' value={jumlahSurat} icon={<MdOutlineMessage size={20} color="white" />} />
                    <CardBar className='bg-secondBlack' text='Surat yang harus di setujui' value={suratBelumDisetujui} icon={<FaSquarePen size={20} color="white" />} />
                    <CardBar className='bg-[#7828c7]' text='Siswa yang sudah di atasi' value={siswaSelesai} icon={<MdOutlineMessage size={20} color="white" />} />
                </div>

                {/* Chart Section */}
                <div className="mt-8 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">📊 Grafik Permintaan Surat</h2>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700 font-semibold">Tahun:</label>
                            <input
                                type="number"
                                min="2020"
                                max={new Date().getFullYear() + 1}
                                value={chartYear}
                                onChange={(e) => setChartYear(parseInt(e.target.value) || new Date().getFullYear())}
                                className="w-24 px-3 py-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800 text-sm"
                            />
                        </div>
                    </div>

                    {isLoadingChart ? (
                        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg border border-gray-300">
                            <div className="text-gray-600">Memuat data chart...</div>
                        </div>
                    ) : chartData.length > 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-300">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                Permintaan Surat per Bulan ({chartYear})
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            color: '#1f2937'
                                        }}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="totalRequest" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        name="Total Permintaan"
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="totalDone" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        name="Total Selesai"
                                        dot={{ fill: '#10b981', r: 4 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="pending" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        name="Pending"
                                        dot={{ fill: '#f59e0b', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg border border-gray-300">
                            <div className="text-gray-600">Tidak ada data untuk tahun {chartYear}</div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-16 mb-3">
                    <h1 className='text-black text-2xl'>PERMINTAAN SURAT SISWA</h1>
                    <button
                        onClick={onExportOpen}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg"
                    >
                        <MdDownload size={20} />
                        Export PDF
                    </button>
                </div>
                <div className="flex w-full px-3 py-2 items-center gap-3 rounded-lg shadow-lg shadow-gray-300/30 my-4 border-2 border-gray-300 bg-white" >
                    <IoSearch color="#2c80fd" size={20} />
                    <input
                        placeholder="SEARCH"
                        className=" border-none w-full text-gray-800 placeholder-gray-500 outline-none focus:ring-0 bg-transparent"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                </div>

                {/* filter berdasarkan status dan tanggal */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setStatusFilter('Semua')}
                            className={`px-3 py-2 rounded-lg shadow-lg shadow-gray-300/30 my-4 border-2 border-gray-300
                ${statusFilter === 'Semua' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setStatusFilter('Menunggu')}
                            className={`px-3 py-2 rounded-lg shadow-lg shadow-gray-300/30 my-4 border-2 border-gray-300
                ${statusFilter === 'Menunggu' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                            Menunggu
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <DatePicker
                            value={dateFilter}
                            onChange={setDateFilter}
                            className="max-w-xs"
                            size='sm'
                            label='Filter Tanggal'
                        />
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter(null)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {role !== 'admin' ? (
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
                            th: 'text-gray-800 bg-white border-b border-gray-300',
                            wrapper: 'min-h-[222px] bg-white text-gray-800 border border-gray-300',
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="name">NAME</TableColumn>
                            <TableColumn key="type">KATEGORI SURAT</TableColumn>
                            <TableColumn key="title">JUDUL SURAT</TableColumn>
                            <TableColumn key="formatted_date">TANGGAL</TableColumn>
                            <TableColumn key="status">STATUS</TableColumn>
                            <TableColumn key="score">PRIORITAS</TableColumn>

                        </TableHeader>
                        <TableBody items={items}>
                            {(item: any) => (
                                <TableRow key={item?._id}>
                                    {(columnKey) => (
                                        <TableCell>
                                            {columnKey === 'action' ? (
                                                <p>{rounded(Number(getKeyValue(item, columnKey)), 2)}</p>
                                            ) : columnKey === 'status' ? (
                                                <p className={`${getStatusColor(item?.status)}`}>{item?.status}</p>
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
                ) : (
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
                            th: 'text-gray-800 bg-white border-b border-gray-300',
                            wrapper: 'min-h-[222px] bg-white text-gray-800 border border-gray-300',
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="name">NAME</TableColumn>
                            <TableColumn key="type">KATEGORI SURAT</TableColumn>
                            <TableColumn key="title">JUDUL SURAT</TableColumn>
                            <TableColumn key="formatted_date">TANGGAL</TableColumn>
                            <TableColumn key="status">STATUS</TableColumn>
                            <TableColumn key="score">PRIORITAS</TableColumn>
                            <TableColumn key="action">ACTION</TableColumn>

                        </TableHeader>
                        <TableBody items={items}>
                            {(item: any) => (
                                <TableRow key={item?._id}>
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
                                                <p className={`${getStatusColor(item?.status)}`}>{item?.status}</p>
                                            )
                                                : (
                                                    getKeyValue(item, columnKey)
                                                )}

                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>)}


            </div>


            <ModalDefault className="bg-white p-6 rounded-xl shadow-xl border border-gray-300" isOpen={isOpen} onClose={onClose}>
                <form onSubmit={handleUpdate} className="text-gray-800 space-y-6">
                    <h1 className="text-2xl font-bold text-center border-b border-gray-300 pb-4">
                        📩 Permintaan Surat
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Nama Surat</p>
                            <p className="text-lg font-semibold">{form.title}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Kategori Surat</p>
                            <p className="text-lg font-semibold">{form.type}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Tanggal Dibutuhkan</p>
                            <p className="text-lg font-semibold">{formatTanggalToIndo(form.date)}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Status Saat Ini</p>
                            <p className="text-lg font-semibold">{form.status}</p>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <p className="text-sm text-gray-600">Deskripsi Siswa</p>
                            <p className="text-base">{form.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                            <label className="block text-sm mb-2 text-gray-700">🔖 Pilih Template Surat</label>
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
                            <label className="block text-sm mb-2 text-gray-700">📌 Ubah Status Surat</label>
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

            <ModalDefault className="bg-white p-6 rounded-xl shadow-xl border border-gray-300" isOpen={isExportOpen} onClose={onExportClose}>
                <div className="text-gray-800 space-y-6">
                    <h1 className="text-2xl font-bold text-center border-b border-gray-300 pb-4">
                        📊 Export Laporan PDF
                    </h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-700 font-semibold">
                                Pilih Tahun
                            </label>
                            <input
                                type="number"
                                min="2020"
                                max={new Date().getFullYear() + 1}
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800"
                                placeholder="Masukkan tahun"
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Info:</strong> PDF akan berisi laporan permintaan surat per bulan dengan detail kategori surat, total permintaan, dan total selesai untuk tahun {selectedYear}.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={handleExportPDF}
                            disabled={isGeneratingPDF}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition px-6 py-2 rounded-lg text-white text-sm shadow flex items-center gap-2"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <MdDownload size={18} />
                                    Export PDF
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onExportClose}
                            disabled={isGeneratingPDF}
                            className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition px-4 py-2 rounded-lg text-white text-sm shadow"
                        >
                            ❌ BATAL
                        </button>
                    </div>
                </div>
            </ModalDefault>


            <div className="p-4 space-y-6 max-w-4xl mx-auto">
                {filledTemplate && (
                    <>
                        {/* Pratinjau A4 yang terlihat */}
                        <div
                            ref={printRef}
                            className="a4-page-preview mx-auto bg-white text-black shadow-lg rounded-lg-md "
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