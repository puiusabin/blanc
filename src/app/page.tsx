"use client";

import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { GithubButton } from "@/components/ui/github-button";
import { WaitlistForm } from "@/components/waitlist-form";
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
    <div className="min-h-screen bg-background relative">
      {/* Background Pattern for Glassmorphism */}
      <div className="absolute inset-0 opacity-40">
        {/* Left side elements */}
        <div className="absolute top-32 left-5 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-8 w-48 h-48 bg-indigo-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-12 w-44 h-44 bg-violet-500 rounded-full blur-3xl"></div>

        {/* Center elements */}
        <div className="absolute top-20 left-1/2 w-36 h-36 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-yellow-400 rounded-full blur-3xl"></div>

        {/* Right side elements */}
        <div className="absolute top-60 right-20 w-56 h-56 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-44 h-44 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/3 w-36 h-36 bg-pink-400 rounded-full blur-3xl"></div>

        {/* Additional scattered elements */}
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-orange-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-38 h-38 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
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
              src="/mail-light.webp"
              alt="Secure email dashboard"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            />
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Join the waitlist
          </h2>

          <WaitlistForm className="max-w-md mx-auto" />
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
