'use client'
import React from 'react'
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
} from "@heroui/react";
import { FaSquarePen } from 'react-icons/fa6'

type Props = {}

const page = (props: Props) => {
    const [page, setPage]: any = React.useState(1);
    const rowsPerPage = 4;

    const pages = Math.ceil(users.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return users.slice(start, end);
    }, [page, users]);

    return (
        <DefaultLayout>
            <div className="grid grid-cols-[3fr_1fr] gap-8">
                {/* Kiri - besar */}
                <div className="">
                    <div className="grid grid-cols-3 gap-4">

                        <div className="p-4 bg-blue-500 rounded-lg ">
                            <div className="flex items-center gap-3">
                                <MdOutlineMessage size={20} color="white" />
                                <h1 className="text-white">Jumlah Surat</h1>
                            </div>
                            <h1 className="text-2xl font-bold text-white">199</h1>
                        </div>
                        <div className="p-4 bg-blue-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FaSquarePen size={20} color="white" />
                                <h1 className="text-white">Surat yang harus di setujui</h1>
                            </div>
                            <h1 className="text-2xl font-bold text-white">199</h1>
                        </div>
                        <div className="p-4 bg-blue-500 rounded-lg">
                            <div className="flex items-center gap-3">
                                <MdOutlineMessage size={20} color="white" />
                                <h1 className="text-white">Siswa yang sudah di atasi</h1>
                            </div>
                            <h1 className="text-2xl font-bold text-white">199</h1>
                        </div>

                    </div>


                    <h1 className='mt-16 text-white text-2xl mb-3 ' >Permintaan surat siswa</h1>
                    <Table
                        aria-label="Example table with client side pagination "
                        bottomContent={
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="secondary"
                                    page={page}
                                    total={pages}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        }
                        classNames={{
                            // bagian kepala tabel
                            th: "text-white bg-black",        // teks kolom header
                            // teks isi cell
                            wrapper: "min-h-[222px] bg-[#16181a] text-white",
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="name">NAME</TableColumn>
                            <TableColumn key="role">ROLE</TableColumn>
                            <TableColumn key="status">STATUS</TableColumn>
                        </TableHeader>
                        <TableBody items={items}>
                            {(item: any) => (
                                <TableRow key={item.name}>
                                    {(columnKey: any) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>


                <div >
                    {/* Kanan - kecil */}
                    <div className="p-4 rounded-lg bg-secondBlack">
                        <p>Hallo</p>
                    </div>

                    <div className="p-4 rounded-lg">
                        <p>Hallo</p>
                    </div>
                </div>


            </div>



        </DefaultLayout >
    )
}

export default page