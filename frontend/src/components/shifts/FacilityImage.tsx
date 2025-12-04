import { useState, useEffect } from "react";
import { FilesAPI } from "../../api/endpoints";

interface FacilityImageProps {
  facilityId: string;
  alt: string;
  className?: string;
}

export function FacilityImage({ facilityId, alt, className = "" }: FacilityImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    FilesAPI.getByEntity("facility", parseInt(facilityId))
      .then((files) => {
        if (cancelled) return;
        const imageFile = files.find((f) => f.category === "RESIDENT_IMAGE");
        if (imageFile) {
          return FilesAPI.get(imageFile.id);
        }
        return null;
      })
      .then((url) => {
        if (cancelled) return;
        setImageUrl(url || null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setImageUrl(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
        <div className="text-xs text-slate-400">Loading...</div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onError={() => setImageUrl(null)}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}>
      NO IMAGE
      <br />
      AVAILABLE
    </div>
  );
}

