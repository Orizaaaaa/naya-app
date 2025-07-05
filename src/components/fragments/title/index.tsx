import Link from 'next/link'
import React from 'react'
import { FaArrowRight } from 'react-icons/fa'

type Props = {
    title: string,
    location?: any
}

const Title = ({ title, location }: Props) => {
    return (
        <div className="flex justify-between border-b-2 border-gray-300 py-5 mx-3 md:mx-0">
            <h1 className='font-bold text-xl md:text-2xl' >{title}</h1>
            <Link href={location} className="flex justify-center items-center gap-2" >
                <h2 className='font-medium text-xl md:text-2xl' >All</h2>
                <FaArrowRight size={20} />
            </Link>
        </div>
    )
}

export default Title