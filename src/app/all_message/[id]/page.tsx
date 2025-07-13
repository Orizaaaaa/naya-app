'use client'
import { getTemplateById } from '@/api/method';
import DefaultLayout from '@/components/layouts/DefaultLayout';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

type Props = {}

function page({ }: Props) {
    const [data, setData] = React.useState({});
    const { id }: any = useParams()
    const [form, setForm] = React.useState({
        name: "",
        type: "",
        body: ``,
    });
    const fetchData = async () => {
        try {
            const result = await getTemplateById(id); // ✅ terima data langsung
            setData(result.data); // ✅ langsung set data
            setForm({
                name: result.data.name,
                type: result.data.type,
                body: result.data.body
            });
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    console.log('kunyuk', data);
    console.log('kunyuk2', form);
    return (
        <DefaultLayout>
            <h1 className='text-white' >DETAIL TEMPLATE</h1>
        </DefaultLayout>
    )
}

export default page