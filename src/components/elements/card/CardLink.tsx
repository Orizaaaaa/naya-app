import Link from 'next/link'
import React from 'react'


type Props = {
    title?: string,
    href: string,
    children: React.ReactNode
}

const CardLink = ({ children, href }: Props) => {
    return (
        <Link href={href} className="rounded-md hover: border-stroke transform transition-transform 
        duration-300 hover:scale-105 bg-white p-3 lg:px-3 lg:py-3 shadow-default 
        dark:border-strokedark h-full grid">
            {children}
        </Link>
    )
}

export default CardLink