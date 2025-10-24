'use client'
import { createCategory, deleteCategory, getAllCategory, updateCategory } from '@/api/method'
import InputForm from '@/components/elements/input/InputForm'
import ModalDefault from '@/components/fragments/modal/modal'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/hook/AuthContext'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from '@heroui/react'
import { on } from 'events'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { BiSolidEdit } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import { FaTrashAlt } from 'react-icons/fa'

type Props = {}

const page = (props: Props) => {
    const [id, setId] = React.useState('');
    const [data, setData] = React.useState([]);
    const { onOpen, onClose, isOpen } = useDisclosure();
    const { onOpen: onOpenUpdate, onClose: onCloseUpdate, isOpen: isOpenUpdate } = useDisclosure();
    const { onOpen: onOpenDelete, onClose: onCloseDelete, isOpen: isOpenDelete } = useDisclosure();
    const [loading, setLoading] = React.useState(false);
    const [form, setForm] = React.useState({
        name: '',
        description: '',
        bobot: '',
    })

    const [formUpdate, setFormUpdate] = React.useState({
        name: '',
        description: '',
        bobot: '',
    })

    const fetchData = async () => {
        try {
            const res: any = await getAllCategory();

            setData(res.data);
        } catch (error) {
            console.error('Gagal fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormUpdate({ ...formUpdate, [name]: value });
    }

    const openCreate = () => {
        onOpen()
    }
    const openUpdate = (value: any) => {
        setId(value._id)
        setFormUpdate(value)
        onOpenUpdate()
    }

    const openDeleteModal = (value: any) => {
        setId(value._id)
        onOpenDelete()
    }

    const handleDelete = async () => {
        const toastId = toast.loading('Menghapus kategori...');
        try {
            const result = await deleteCategory(id);
            if (result) {
                toast.success('Kategori berhasil dihapus!', { id: toastId });
                fetchData();
                onCloseDelete();
            } else {
                toast.error('Gagal menghapus kategori.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat menghapus.', { id: toastId });
        }
    }

    const handleUpdateCategory = async () => {
        const toastId = toast.loading('Memperbarui kategori...');
        try {
            const result = await updateCategory(id, formUpdate);
            if (result) {
                toast.success('Kategori berhasil diperbarui!', { id: toastId });
                fetchData();
                onCloseUpdate();
                setFormUpdate({
                    name: '',
                    description: '',
                    bobot: '',
                })
            } else {
                toast.error('Gagal memperbarui kategori.', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan saat memperbarui.', { id: toastId });
        }
    }

    const handleCreateCategory = async () => {
        const toastId = toast.loading('Menyimpan kategori...')
        try {
            const result = await createCategory(form)
            if (result) {
                toast.success('Kategori berhasil disimpan!', { id: toastId })
                fetchData()
                onClose()
                setForm({
                    name: '',
                    description: '',
                    bobot: '',
                })
            } else {
                toast.error('Gagal menyimpan kategori.', { id: toastId })
            }
        } catch (error) {
            console.error(error)
            toast.error('Terjadi kesalahan saat menyimpan.', { id: toastId })
        }
    }

    console.log(data);
    const { role } = useAuth();
    return (
        <DefaultLayout>
            {role === 'admin' && <div className="flex justify-end mb-4">
                <button onClick={() => openCreate()} className='bg-primary text-white px-4 py-2 rounded-md' >Tambah Kategori</button>
            </div>}

            <div className="grid grid-cols-3 gap-4">
                {data.map((item: any, index: number) => (
                    <div className="  bg-white rounded-xl shadow-xl overflow-hidden " key={index}>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-800 truncate">{item.name}</h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {item.bobot}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm h-16 overflow-hidden">
                                {item.description}
                            </p>
                            {role === 'admin' && (
                                <div className="flex justify-end gap-2 items-center">
                                    <BiSolidEdit onClick={() => openUpdate(item)} className='cursor-pointer' color='blue' size={25} />
                                    <FaTrashAlt onClick={() => openDeleteModal(item)} className='cursor-pointer' color='red' size={19} />
                                </div>
                            )}

                        </div>
                    </div>
                ))}

            </div>
            <ModalDefault isOpen={isOpen} onClose={onClose} >
                <div className='p-3' >
                    <h1 className='text-xl font-bold' >Tambah Kategori</h1>

                    <div className='mt-4'>
                        <InputForm
                            styleTitle="mb-2"
                            className="bg-gray-200"
                            htmlFor="name"
                            title="Nama Kategori"
                            type="text"

                            onChange={handleChange}
                            value={form.name}
                        />

                        <InputForm
                            styleTitle="mb-2"
                            className="bg-gray-200"
                            htmlFor="description"
                            title="Deskripsi"
                            type="text"

                            onChange={handleChange}
                            value={form.description}
                        />

                        <InputForm
                            styleTitle="mb-2"
                            className="bg-gray-200"
                            htmlFor="bobot"
                            title="Bobot"
                            type="number"

                            onChange={handleChange}
                            value={form.bobot}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                            >
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                                onClick={handleCreateCategory}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </ModalDefault>

            <ModalDefault isOpen={isOpenUpdate} onClose={onCloseUpdate}>
                <div className="p-3">
                    <h1 className="text-xl font-bold">Update Kategori</h1>

                    <div className="mt-4">
                        <InputForm
                            styleTitle="mb-2"
                            className="bg-gray-200"
                            htmlFor="name"
                            title="Nama Kategori"
                            type="text"

                            onChange={handleUpdate}
                            value={formUpdate.name}
                        />

                        <InputForm
                            styleTitle="mb-2"
                            className="bg-gray-200"
                            htmlFor="description"
                            title="Deskripsi"
                            type="text"

                            onChange={handleUpdate}
                            value={formUpdate.description}
                        />

                        <InputForm
                            styleTitle="mb-2"
                            className="bg-gray-200"
                            htmlFor="bobot"
                            title="Bobot"
                            type="number"
                            onChange={handleUpdate}
                            value={formUpdate.bobot}
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={onCloseUpdate}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                            >
                                Batal
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-blue-500 text-white" onClick={handleUpdateCategory}>
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </ModalDefault>

            <ModalAlert isOpen={isOpenDelete} onClose={onCloseDelete}
                closeButton={true} className='bg-white' >
                Apakah anda yakin ingin menghapus kategori ini?
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCloseDelete}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Batal
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-red-500 text-white" onClick={handleDelete}>
                        Ya
                    </button>
                </div>
            </ModalAlert>
        </DefaultLayout>

    )
}

export default page