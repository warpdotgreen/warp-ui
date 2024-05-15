interface NavConfig {
  name: string
  link: string
  isExternalLink?: boolean
}

export const navConfig: NavConfig[] = [
  {
    name: 'Bridge',
    link: '/bridge'
  },
  {
    name: 'Supported Assets',
    link: '/bridge/assets'
  },
  {
    name: 'Docs',
    link: 'https://docs.warp.green/developers/introduction',
    isExternalLink: true
  },
  {
    name: 'FAQ',
    link: 'https://docs.warp.green',
    isExternalLink: true
  },
  {
    name: 'Status',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isExternalLink: true
  }
]