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
          href={'/build'}
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
        <Link
          style={{
            padding: 5,
            marginRight: 2,
            marginLeft: 2,
            color: 'black',
          }}
          href={'/profile'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-person-circle"
            viewBox="0 0 16 16"
          >
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path
              fillRule="evenodd"
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
            />
          </svg>
        </Link>
      </ul>
    </div>
  )
}
