import type { Metadata } from "next";
import { parsePatternName } from "@/lib/patterns";
import { PatternDisplayContent } from "@/components/pattern-display-content";

interface PatternPageProps {
  params: Promise<{
    pattern: string;
  }>;
}

export async function generateMetadata({ params }: PatternPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const patternName = resolvedParams.pattern;
  const pattern = parsePatternName(patternName);
  
  if (!pattern) {
    return {
      title: "Signal Not Found - Signal Up",
      description: "This signal link is invalid or malformed.",
    };
  }

  const title = `${patternName.toUpperCase()} - Signal Up`;
  const description = `Look for this ${pattern.animation} signal flashing at speed ${pattern.speed}. Put your signal up and let friends find you!`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: `Signal Up: ${patternName.toUpperCase()}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image.png"],
    },
  };
}

export default async function PatternDisplay({ params }: PatternPageProps) {
  const resolvedParams = await params;
  const patternName = resolvedParams.pattern;
  
  return <PatternDisplayContent patternName={patternName} />;
}