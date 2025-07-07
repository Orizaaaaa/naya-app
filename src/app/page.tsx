'use client'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@heroui/react';
import React from 'react'

type Props = {}

const page = (props: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <section>
      <h1>login</h1>
    </section>
  )
}

export default page