'use client'

import { DoppelgangerBackground } from '@/components/doppelganger'

export default function DoppelgangerLayout({ children }) {
    return (
        <DoppelgangerBackground>
            {children}
        </DoppelgangerBackground>
    )
}
