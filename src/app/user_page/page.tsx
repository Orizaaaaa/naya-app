'use client'
import { getAllTemplate, getMessageUser } from '@/api/method';
import SpotlightCard from '@/components/fragments/cardBox/CardSpot';
import { useDisclosure } from '@heroui/react';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react'
import { LuSquarePen } from 'react-icons/lu';

type Props = {}

function page({ }: Props) {
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [userMessage, setUserMessage] = useState({});
    const [idUser, setIdUser] = useState<string | null>(null);

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



    return (
        <div className="bg-black h-screen">
            <div className="container mx-auto p-5">
                <h1 className='text-white my-9' >SURAT YANG KAMU AJUKAN</h1>
                <div className="grid grid-cols-4 gap-4">

                </div>


                <h1 className='text-white my-9' >SEMUA SURAT YANG ADA</h1>
                <div className="grid grid-cols-4 gap-4">
                    {data?.map((item: any) => (
                        <SpotlightCard key={item.id} className="custom-spotlight-card text-white" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <h1>{item.name}</h1>
                            <h2>{item.type}</h2>
                            <div className="flex justify-end">
                                <button onClick={() => router.push(`/all_message/${item.id}`)} className='bg-blue-500/30 cursor-pointer rounded-lg py-2 px-3 flex flex-row justify-center items-center gap-2'>
                                    <LuSquarePen />
                                    <p>Minta Surat</p>
                                </button>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default page