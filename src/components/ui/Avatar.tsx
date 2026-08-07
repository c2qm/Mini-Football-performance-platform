import "./Avatar.css";

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  presetEmoji?: string;
  presetBg?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("");
}

export function Avatar({ src, name, size = 56, presetEmoji, presetBg }: AvatarProps) {
  const style = { width: size, height: size, fontSize: size * 0.36 };

  if (src) {
    return <img src={src} alt={name} className="avatar avatar--image" style={style} />;
  }

  if (presetEmoji) {
    return (
      <div
        className="avatar avatar--preset"
        style={{ ...style, backgroundColor: presetBg, fontSize: size * 0.46 }}
      >
        {presetEmoji}
      </div>
    );
  }

  return (
    <div className="avatar avatar--fallback" style={style}>
      {getInitials(name)}
    </div>
  );
}
