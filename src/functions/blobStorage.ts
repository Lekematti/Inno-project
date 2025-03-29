const fetchBlob = async () => {
  try {
    const res = await fetch('/api/blob')

    if (!res.ok) {
      throw new Error('Failed to fetch blob data')
    }

    const data = await res.json()
    console.log(data)
    return data
  } catch (error) {
    console.error('Error fetching blob data:', error)
    throw error
  }
}

const postBlob = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/blob', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`)
    }

    console.log('File uploaded successfully!')
  } catch (error) {
    console.error('Error posting blob data:', error)
    throw error
  }
}

export { fetchBlob, postBlob }
