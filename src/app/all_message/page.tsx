import DefaultLayout from '@/components/layouts/DefaultLayout'
import React from 'react'
import { LuSquarePen } from 'react-icons/lu'

type Props = {}

const page = (props: Props) => {
    return (
        <DefaultLayout>
            <div className="grid grid-cols-4">
                <div className='text-white bg-secondBlack rounded-xl p-4' >
                    <h1>Surat pemberantasan korupsi Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque aliquid quas veritatis veniam, enim ipsa laborum neque! Inventore necessitatibus nesciunt, odio reprehenderit accusamus modi, minima in deserunt quam, optio ratione!</h1>
                    <div className="grid grid-cols-2 gap-5 mt-5">
                        <button className='bg-blue-500/30 rounded-lg p-1 flex flex-row justify-center items-center gap-2'>
                            <LuSquarePen />
                            <p>Edit</p>
                        </button>
                        <button className='bg-red-900  rounded-lg p-1' >Hapus</button>
                    </div>
                </div>

            </div>
        </DefaultLayout>
    )
}

export default page