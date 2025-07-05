import { Autocomplete, AutocompleteItem } from '@nextui-org/react'
import React from 'react'

type Props = {
    clearButton: any
    onSelect: any
    defaultItems: any
    children: any

}

const DropdownCustom = ({ clearButton, onSelect, defaultItems, children }: Props) => {
    return (
        <Autocomplete
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