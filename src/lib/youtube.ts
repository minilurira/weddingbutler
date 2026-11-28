/** 유튜브 주소(watch·youtu.be·shorts·live·embed)에서 11자리 영상 ID를 뽑는다. 아니면 null. */
export function youtubeId(url: string): string | null {
  const m = url
    .trim()
    .match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** 쿠키를 덜 남기는 youtube-nocookie 임베드 주소 */
export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`;
}
