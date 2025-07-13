'use client'
import { deleteTemplate, getAllTemplate } from '@/api/method'
import SpotlightCard from '@/components/fragments/cardBox/CardSpot'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useDisclosure } from '@heroui/react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { LuSquarePen } from 'react-icons/lu'

type Props = {}

const page = (props: Props) => {
    const [id, setId] = React.useState('');
    const router = useRouter();
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const openModalDelete = (value: any) => {
        setId(value)
        onWarningOpen()
    }
    const [data, setData] = React.useState([]);
    const fetchData = async () => {
        try {
            const res: any = await getAllTemplate();

            setData(res.data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    console.log(data);

    const handleDeleteTemplate = async () => {
        deleteTemplate(id).then((result) => {
            if (result) {
                fetchData();
                onWarningClose();
            }
        })
    }
    return (
        <DefaultLayout>
            <div className="grid grid-cols-4 gap-4">
                {data?.map((item: any) => (
                    <SpotlightCard key={item.id} className="custom-spotlight-card text-white" spotlightColor="rgba(0, 229, 255, 0.2)">
                        <h1>{item.name}</h1>
                        <h2>{item.type}</h2>
                        <div className="grid grid-cols-2 gap-5 mt-5">
                            <button onClick={() => router.push(`/all_message/${item.id}`)} className='bg-blue-500/30 cursor-pointer rounded-lg p-1 flex flex-row justify-center items-center gap-2'>
                                <LuSquarePen />
                                <p>Edit</p>
                            </button>
                            <button className='bg-red-900  rounded-lg p-1 cursor-pointer' onClick={() => openModalDelete(item.id)}>Hapus</button>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                apakah anda yakin akan menghapus surat ini ?
                <div className="flex justify-end gap-3">
                    <button className='bg-red-900  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={onWarningClose}>Tidak</button>
                    <button className='bg-blue-500  rounded-lg p-1 cursor-pointer py-2 px-3 text-white' onClick={handleDeleteTemplate} >Ya</button>
                </div>
            </ModalAlert>
        </DefaultLayout>
    )
}

export default page