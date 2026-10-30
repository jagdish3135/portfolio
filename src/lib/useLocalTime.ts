import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/** Live time in Surat (IST), updated every second. */
export function useISTTime() {
  const [time, setTime] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt.format(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}
