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

export default fetchBlob
