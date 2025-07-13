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
import CardBar from '@/components/fragments/cardBox/CardBar'
import { IoSearch } from 'react-icons/io5'

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

            {/* Kiri - besar */}
            <div className="">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

                    <CardBar className='bg-blue-500' text='Jumlah Surat' value='199' icon={<MdOutlineMessage size={20} color="white" />} />
                    <CardBar className='bg-secondBlack' text='Surat yang harus di setujui' value='199' icon={<FaSquarePen size={20} color="white" />} />
                    <CardBar className='bg-[#7828c7]' text='Siswa yang sudah di atasi' value='199' icon={<MdOutlineMessage size={20} color="white" />} />
                </div>


                <h1 className='mt-16 text-white text-2xl mb-3 ' >PERMINTAAN SURAT SISWA</h1>
                <div className="flex w-full px-3 py-2 items-center gap-3 rounded-lg shadow-lg shadow-black/30 my-4 border-2 border-grayCustom" >
                    <IoSearch color="#2c80fd" size={20} />
                    <input placeholder="SEARCH" className=" border-none w-full text-white placeholder-gray-500 outline-none focus:ring-0" type="text" />
                </div>
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





        </DefaultLayout >
    )
}

export default page