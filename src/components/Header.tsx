import Link from 'next/link'

export const Header = () => {
  return (
    <div
      style={{
        width: '100%',
        padding: 10,
        display: 'flex',
        background: '#3B82F6',
        alignItems: 'center',
      }}
    >
      <p style={{ color: '#1F2937', fontWeight: 'bold' }}>AiWebsiteBuildr</p>
      <ul
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          listStyle: 'none',
          margin: 2,
        }}
      >
        <Link
          style={{
            padding: 5,
            marginRight: 2,
            marginLeft: 2,
            color: 'black',
          }}
          href={'/'}
        >
          Home
        </Link>
        <Link
          style={{
            padding: 5,
            marginRight: 2,
            marginLeft: 2,
            color: 'black',
          }}
          href={'/buildpage'}
        >
          Build
        </Link>
        <Link
          style={{
            padding: 5,
            marginRight: 2,
            marginLeft: 2,
            color: 'black',
          }}
          href={'/contact'}
        >
          Contact
        </Link>
      </ul>
    </div>
  )
}
