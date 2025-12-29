interface VideoPlayerProps {
  embedUrl: string
  title: string
}

/**
 * VideoPlayer component for embedding video streams
 * 
 * IMPORTANT: This component does NOT use the sandbox attribute on iframes.
 * This is required for sports streams to function properly.
 * Do NOT add sandbox attribute to iframes in this component.
 */
export const VideoPlayer = ({ embedUrl, title }: VideoPlayerProps) => {
  return (
    <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        // NOTE: No sandbox attribute - required for sports streams to work
      />
    </div>
  )
}

