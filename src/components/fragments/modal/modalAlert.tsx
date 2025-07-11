import React from 'react'

import Image from 'next/image'
import { Modal, ModalBody, ModalContent } from '@heroui/react'
import { warning } from '@/app/image'


type Props = {
    isOpen?: any
    onClose?: any
    children?: React.ReactNode
    closeButton?: boolean
    className?: string
}

const ModalAlert = ({ isOpen, onClose, children, closeButton, className }: Props) => {
    return (
        <Modal
            size={'xl'}
            isOpen={isOpen}
            onClose={onClose}
            isDismissable={false} isKeyboardDismissDisabled={true}
            hideCloseButton={closeButton}
        >
            <ModalContent>
                <>
                    <ModalBody className={`overflow-x-hidden ${className}`}>
                        <div className="flex justify-center items-center">
                            <Image className="w-10 h-10" src={warning} alt="warning" />
                        </div>
                        {children}
                    </ModalBody>
                </>
            </ModalContent>
        </Modal>
    )
}

export default ModalAlert