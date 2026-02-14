'use client'

import { DoppelgangerBackground } from '@/components/doppelganger'

export default function DoppelgangerRootLayout({ children }) {
    return (
        <DoppelgangerBackground>
            {children}
        </DoppelgangerBackground>
    )
}
