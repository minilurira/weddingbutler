/* 모바일 청첩장 배경음악 업로드용 저장소. 3MB 이하 mp3/m4a만 받습니다. 다시 실행해도 안전합니다. */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-audio', 'invitation-audio', true, 3145728, array['audio/mpeg', 'audio/mp4'])
on conflict (id) do nothing;
