import React from 'react'
import { MdOutlineMessage } from 'react-icons/md'

type Props = {
    className?: string
    text: string
    icon: any
    value: string
}

export default function CardBar({ className, text, icon, value }: Props) {
    return (
        <div className={`p-4  rounded-lg ${className}`}>
            <div className="flex items-center gap-3">
                {icon}
                <h1 className="text-white">{text}</h1>
            </div>
            <h1 className="text-2xl font-bold text-white mt-7">{value}</h1>
        </div>
    )
}