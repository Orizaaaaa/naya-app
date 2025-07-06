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

                        <CardBar className='bg-blue-500' text='Jumlah Surat' value='199' icon={<MdOutlineMessage size={20} color="white" />} />
                        <CardBar className='bg-secondBlack' text='Surat yang harus di setujui' value='199' icon={<FaSquarePen size={20} color="white" />} />
                        <CardBar className='bg-[#7828c7]' text='Siswa yang sudah di atasi' value='199' icon={<MdOutlineMessage size={20} color="white" />} />


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
                    <div className="p-4 rounded-lg bg-secondBlack text-white">
                        <h1 className='text-center  text-white py-2 rounded-lg font-medium' >TERAKHIR DI SETUJUI</h1>
                        <div className="text mt-5">
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Oriza Sativa</h1>
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Alya Prameswari</h1>
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Bagas Wicaksono</h1>
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Citra Maharani</h1>
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Dimas Aditya</h1>
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Eka Lestari</h1>
                            <h1 className='mb-3 bg-slate-200 rounded-lg text-black p-2'>Farhan Naufal</h1>

                        </div>
                    </div>


                </div>


            </div>



        </DefaultLayout >
    )
}

export default page