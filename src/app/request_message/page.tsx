'use client';

import { getAllRequestMessage } from '@/api/method';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react';
import React, { useEffect } from 'react';

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
                                    ) : (
                                        getKeyValue(item, columnKey)
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </DefaultLayout>
    );
};

export default Page;
