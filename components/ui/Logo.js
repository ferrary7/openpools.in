import Image from 'next/image'

export default function Logo({ className = '', width = 150, height = 40 }) {
  return (
    <Image
      src="/logo.svg"
      alt="OpenPools.in"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
