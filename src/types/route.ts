import { ComponentType } from 'react'

export interface Route {
  key: string
  title: string
  description: string
  component: ComponentType
  path: string
  isEnabled: boolean
  children?: Route[]
}
