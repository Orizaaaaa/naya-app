import { Modal, ModalBody, ModalContent } from "@heroui/react"


type Props = {
    isOpen?: any
    onClose?: any
    children?: React.ReactNode
    closeButton?: boolean
    className?: string
}

const ModalDefault = ({ isOpen, onClose, children, closeButton, className }: Props) => {
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
                        {children}
                    </ModalBody>
                </>
            </ModalContent>
        </Modal>
    )
}

export default ModalDefault