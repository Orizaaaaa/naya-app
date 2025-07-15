'use client'
import { getAllTemplate, getMessageUser } from '@/api/method';
import InputForm from '@/components/elements/input/InputForm';
import SpotlightCard from '@/components/fragments/cardBox/CardSpot';
import ModalDefault from '@/components/fragments/modal/modal';
import { formatDate } from '@/utils/helper';
import { DatePicker, useDisclosure } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useRouter } from 'next/navigation';

import React, { useEffect, useState } from 'react'
import { IoNewspaperOutline } from 'react-icons/io5';
import { LuSquarePen } from 'react-icons/lu';

type Props = {}

function page({ }: Props) {
    const dateNow = new Date();
    const [loading, setLoading] = useState<boolean>(false)
    const { onOpen, onClose, isOpen } = useDisclosure();
    const router = useRouter();
    const [data, setData] = useState([]);

    const [form, setForm] = useState({
        title: "",
        type: "",
        body: "",
        description: "",
        date: parseDate(formatDate(dateNow)),
        status: "menunggu",
        user_id: "",
    });


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

    const opanModalRequest = (id: string) => {
        onOpen();
        console.log(id);
    }

    const handleCreateMessage = () => {


    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    console.log(form);

    return (
        <div className="bg-black h-screen">
            <div className="container mx-auto p-5">
                <h1 className='text-white my-9' >SEMUA SURAT YANG ADA</h1>
                <div className="grid grid-cols-4 gap-4">
                    {data?.map((item: any) => (
                        <SpotlightCard key={item.id} className="custom-spotlight-card text-white" spotlightColor="rgba(0, 229, 255, 0.2)">
                            <h1>{item.name}</h1>
                            <h2>{item.type}</h2>
                            <div className="flex justify-end mt-5">
                                <button onClick={() => opanModalRequest(item.id)} className='bg-blue-500/30 cursor-pointer rounded-lg py-2 px-3 flex flex-row justify-center items-center gap-2'>
                                    <IoNewspaperOutline size={20} />
                                    <p>Minta Surat</p>
                                </button>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>

            <ModalDefault className='bg-secondBlack' isOpen={isOpen} onClose={onClose} closeButton={false} >
                <h1 className='text-white mb-6' >PERMINTAAN SURAT</h1>
                <form onSubmit={handleCreateMessage}>
                    <InputForm className='bg-white rounded-xl' placeholder='Deskripsi' type='text' htmlFor='description' value={form.description} onChange={handleChange} />

                    <div className="text-white">
                        <DatePicker
                            aria-label='date'
                            name='date'
                            value={form.date}
                            label='Surat tersebut di butuhkan untuk tanggal'
                            showMonthAndYearPickers
                            onChange={(e: any) => setForm({ ...form, date: e })}
                        />
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
        </div>
    )
}

export default page