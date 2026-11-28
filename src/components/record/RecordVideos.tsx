import type { RecordVideo } from '@/types/record';
import { youtubeEmbedUrl, youtubeId } from '@/lib/youtube';
import { IconVideo } from './icons';

/** 축의 기록 영상. 유튜브는 화면 안 플레이어로, 그 밖의 주소는 링크 버튼으로 보여 준다. 양가는 신랑측·신부측 2개. */
export function RecordVideos({ videos }: { videos: RecordVideo[] }) {
  if (videos.length === 0) return null;
  return (
    <section id="wbr-videos" className="wbr-card wbr-videos" aria-label="영상">
      <h2>{videos.length > 1 ? '영상' : videos[0].label}</h2>
      <div className={`wbr-videos__grid${videos.length > 1 ? ' wbr-videos__grid--two' : ''}`}>
        {videos.map((v) => {
          const id = youtubeId(v.url);
          return (
            <div key={v.url + v.label} className="wbr-video">
              {videos.length > 1 && <div className="wbr-video__label">{v.label}</div>}
              {id ? (
                <div className="wbr-video__frame">
                  <iframe
                    src={youtubeEmbedUrl(id)}
                    title={v.label}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a className="wbr-btn" href={v.url} target="_blank" rel="noopener noreferrer">
                  <IconVideo /> {v.label} 보기
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** 예전 payload(videoUrl 하나)도 받는다 */
export function videosOf(meta: { videos?: RecordVideo[]; videoUrl?: string }): RecordVideo[] {
  if (meta.videos) return meta.videos.filter((v) => v.url);
  return meta.videoUrl ? [{ label: '운영 영상', url: meta.videoUrl }] : [];
}
