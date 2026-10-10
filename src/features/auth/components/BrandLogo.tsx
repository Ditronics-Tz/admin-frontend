import React from 'react'
import { RidaLogo, type RidaLogoProps } from '@/components/brand/RidaLogo'

export type BrandLogoProps = RidaLogoProps

/**
 * BrandLogo component rendering the official Rida emblem mark and operations subtitle
 */
export const BrandLogo: React.FC<BrandLogoProps> = (props) => {
  return <RidaLogo {...props} />
}

