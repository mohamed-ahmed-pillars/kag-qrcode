"use client";

export default function BackgroundVideo({ src }: { src: string }) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      disablePictureInPicture
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0.8, zIndex: 0 }}
      onEnded={(e) => { e.currentTarget.play(); }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
