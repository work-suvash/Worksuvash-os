import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export function MediaPlayer() {
  const [src, setSrc] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [kind, setKind] = useState<'video' | 'audio'>('video');
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    setName(f.name);
    setKind(f.type.startsWith('audio') ? 'audio' : 'video');
    setSrc(URL.createObjectURL(f));
  };

  return (
    <div className="h-full w-full bg-black text-white flex flex-col">
      <div className="p-2 border-b border-white/10 flex items-center gap-2 text-sm">
        <button onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded">
          <Upload className="w-3.5 h-3.5" /> Open file
        </button>
        <input ref={inputRef} type="file" accept="video/*,audio/*" hidden
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <span className="text-white/60 truncate">{name || 'No file selected'}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {!src && <div className="text-white/40 text-sm">Choose a video or audio file to play.</div>}
        {src && kind === 'video' && (
          <video src={src} controls autoPlay className="max-h-full max-w-full" />
        )}
        {src && kind === 'audio' && (
          <audio src={src} controls autoPlay className="w-full max-w-md" />
        )}
      </div>
    </div>
  );
}
export default MediaPlayer;
