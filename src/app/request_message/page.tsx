'use client'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { users } from '@/utils/font'
import { getKeyValue, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import React from 'react'

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
        </DefaultLayout>

    )
}

export default page