export function downloadCsv(url: string, filename: string) {
  const token = localStorage.getItem('token')
  fetch(`/api${url}`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
    })
    .catch(() => {})
}
