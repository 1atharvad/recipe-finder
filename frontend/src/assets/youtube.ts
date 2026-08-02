export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace('/embed/', '')
      } else {
        videoId = parsed.searchParams.get('v')
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}
