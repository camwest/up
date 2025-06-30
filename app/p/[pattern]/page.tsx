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
      title: "Pattern Not Found - Concert Finder",
      description: "This pattern link is invalid or malformed.",
    };
  }

  const title = `${patternName.toUpperCase()} - Concert Finder Pattern`;
  const description = `Look for this ${pattern.animation} pattern flashing at speed ${pattern.speed}. Click to display the pattern and hold your phone up high so friends can find you!`;
  
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
          alt: `Concert Finder Pattern: ${patternName.toUpperCase()}`,
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