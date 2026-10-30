"use client";

import { useEffect, useRef, useState } from "react";

export default function ProductCardImage({
    src,
    alt,
}: {
    src: string;
    alt: string;
}) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const loaded = loadedSrc === src;
    const failed = failedSrc === src;

    useEffect(() => {
        const image = imageRef.current;
        if (!image?.complete) return;

        if (image.naturalWidth > 0) {
            setLoadedSrc(src);
        } else {
            setFailedSrc(src);
        }
    }, [src]);

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            {!loaded && !failed && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 animate-pulse bg-gray-200"
                />
            )}
            {failed ? (
                <span className="text-sm text-gray-400">Image unavailable</span>
            ) : (
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoadedSrc(src)}
                    onError={() => setFailedSrc(src)}
                    className={`h-full w-full object-contain p-3 transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                />
            )}
        </div>
    );
}