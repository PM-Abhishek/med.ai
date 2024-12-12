'use client'

import { motion } from 'framer-motion'
import { Ambulance } from 'lucide-react'

export function AmbulanceAnimation() {
  return (
    <div className="relative w-full h-16 overflow-hidden">
      <motion.div
        initial={{ x: '0%' }}
        animate={{ x: '500%' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-y-0 flex items-center"
      >
        <Ambulance className="w-16 h-16 text-red-500" />
      </motion.div>
    </div>
  )
}

