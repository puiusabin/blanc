"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GithubButton } from "@/components/ui/github-button";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/puiusabin/blanc")
      .then((res) => res.json())
      .then((data: unknown) => {
        const repoData = data as { stargazers_count?: number };
        if (repoData.stargazers_count !== undefined) {
          setStarCount(repoData.stargazers_count);
        }
      })
      .catch(() => {
        // Fallback if API fails
        setStarCount(0);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                🚧 Pre-Launch
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                The future of private email is being built
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Zero-knowledge, end-to-end encrypted email using your crypto
                wallet as identity. Follow our progress on GitHub!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <GithubButton
                initialStars={0}
                targetStars={starCount || 0}
                separator={true}
                label="Star"
                roundStars={true}
                repoUrl="https://github.com/puiusabin/blanc"
                variant="outline"
                size="lg"
                autoAnimate={true}
              />
            </div>
          </div>

          <div className="relative">
            <Image
              src="/mail-light.png"
              alt="Secure messaging dashboard"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Simple Footer CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>🚧 Under active development</p>
            <p>Follow progress and contribute on GitHub</p>
          </div>
        </div>
      </section>
    </div>
  );
}
