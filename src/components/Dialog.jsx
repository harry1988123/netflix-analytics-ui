import React from 'react'
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from './ui/dialog.jsx'

export default function Dialog({ isOpen, onClose, title, children }) {
  return (
    <ShadcnDialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] mx-4 flex flex-col p-0"
        onInteractOutside={onClose}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-border">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </DialogContent>
    </ShadcnDialog>
  )
}

