'use client'
import SpotlightCard from '@/components/fragments/cardBox/CardSpot'
import ModalAlert from '@/components/fragments/modal/modalAlert'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useDisclosure } from '@heroui/react'
import React from 'react'
import { LuSquarePen } from 'react-icons/lu'

type Props = {}

const page = (props: Props) => {
    const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure();
    const openModalDelete = () => {
        onWarningOpen()
    }
    return (
        <DefaultLayout>
            <div className="grid grid-cols-4 gap-4">

                <SpotlightCard className="custom-spotlight-card text-white" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h1>Surat pemberantasan korupsi Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque aliquid quas veritatis veniam, enim ipsa laborum neque! Inventore necessitatibus nesciunt, odio reprehenderit accusamus modi, minima in deserunt quam, optio ratione!</h1>
                    <div className="grid grid-cols-2 gap-5 mt-5">
                        <button className='bg-blue-500/30 rounded-lg p-1 flex flex-row justify-center items-center gap-2'>
                            <LuSquarePen />
                            <p>Edit</p>
                        </button>
                        <button className='bg-red-900  rounded-lg p-1 cursor-pointer' onClick={openModalDelete}>Hapus</button>
                    </div>
                </SpotlightCard>
                <SpotlightCard className="custom-spotlight-card text-white" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h1>Surat pemberantasan korupsi Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque aliquid quas veritatis veniam, enim ipsa laborum neque! Inventore necessitatibus nesciunt, odio reprehenderit accusamus modi, minima in deserunt quam, optio ratione!</h1>
                    <div className="grid grid-cols-2 gap-5 mt-5">
                        <button className='bg-blue-500/30 rounded-lg p-1 flex flex-row justify-center items-center gap-2'>
                            <LuSquarePen />
                            <p>Edit</p>
                        </button>
                        <button className='bg-red-900  rounded-lg p-1 cursor-pointer' onClick={openModalDelete} >Hapus</button>
                    </div>
                </SpotlightCard>
                <SpotlightCard className="custom-spotlight-card text-white" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h1>Surat pemberantasan korupsi Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque aliquid quas veritatis veniam, enim ipsa laborum neque! Inventore necessitatibus nesciunt, odio reprehenderit accusamus modi, minima in deserunt quam, optio ratione!</h1>
                    <div className="grid grid-cols-2 gap-5 mt-5">
                        <button className='bg-blue-500/30 rounded-lg p-1 flex flex-row justify-center items-center gap-2'>
                            <LuSquarePen />
                            <p>Edit</p>
                        </button>
                        <button className='bg-red-900  rounded-lg p-1 cursor-pointer' onClick={openModalDelete} >Hapus</button>
                    </div>
                </SpotlightCard>

            </div>

            <ModalAlert isOpen={isWarningOpen} onClose={onWarningClose} >
                apakah anda yakin akan menghapus surat ini ?
            </ModalAlert>
        </DefaultLayout>
    )
}

export default page