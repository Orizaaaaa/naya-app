
import { Autocomplete } from '@heroui/react'
import React from 'react'

type Props = {
    clearButton: any
    onSelect: any
    defaultItems: any
    children: any
    label?: string
}

const DropdownCustom = ({ clearButton, onSelect, defaultItems, children, label }: Props) => {
    return (
        <Autocomplete
            label={label}
            aria-label='dropdown'
            clearButtonProps={clearButton}
            onSelect={onSelect}
            defaultItems={defaultItems}
            className="max-w-xs border-2 border-primary rounded-lg "
            size='sm'
        >
            {children}
        </Autocomplete>
    )
}

export default DropdownCustom