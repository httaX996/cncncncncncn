import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FaTimes, FaCheck } from 'react-icons/fa'

interface Source {
    id: string
    name: string
    providerId: number
    color: string
}

const SOURCES: Source[] = [
    { id: 'netflix', name: 'Netflix', providerId: 8, color: '#E50914' },
    { id: 'disney', name: 'Disney+', providerId: 337, color: '#113CCF' },
    { id: 'hbo', name: 'HBO Max', providerId: 384, color: '#9933CC' }, // Max
    { id: 'prime', name: 'Prime Video', providerId: 9, color: '#00A8E1' },
    { id: 'hulu', name: 'Hulu', providerId: 15, color: '#1CE783' },
]

interface SourcesDialogProps {
    isOpen: boolean
    onClose: () => void
    selectedSources: number[]
    onToggleSource: (providerId: number) => void
}

export const SourcesDialog = ({ isOpen, onClose, selectedSources, onToggleSource }: SourcesDialogProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-bold text-white">
                                        Select Sources
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {SOURCES.map((source) => {
                                        const isSelected = selectedSources.includes(source.providerId)
                                        return (
                                            <button
                                                key={source.id}
                                                onClick={() => onToggleSource(source.providerId)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${isSelected
                                                        ? 'bg-white/10 border-white/30'
                                                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-3 h-10 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                                        style={{ backgroundColor: source.color }}
                                                    />
                                                    <span className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                        {source.name}
                                                    </span>
                                                </div>

                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-primary border-primary text-black'
                                                        : 'border-gray-600 group-hover:border-gray-400'
                                                    }`}>
                                                    {isSelected && <FaCheck className="text-xs" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
