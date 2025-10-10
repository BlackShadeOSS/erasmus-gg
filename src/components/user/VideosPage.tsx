"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import GlowingCircle from "@/components/ui/glowing-circle";
import NoiseFilter from "@/components/NoiseFilter";
import { UserSession } from "@/lib/auth";
import DashboardSidebar from "@/components/user/DashboardSidebar";
import { Play } from "lucide-react";

interface UserDashboardProps {
  user: UserSession;
}

interface Video {
  id: string;
  title: string;
  driveUrl: string;
  embedUrl: string;
}

const videos: Video[] = [
  {
    id: "13QCPLSImmdeHAc5nRnx_N95f_vsndUQ_",
    title: "Film 1",
    driveUrl:
      "https://drive.google.com/open?id=13QCPLSImmdeHAc5nRnx_N95f_vsndUQ_&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/13QCPLSImmdeHAc5nRnx_N95f_vsndUQ_/preview",
  },
  {
    id: "1ndGnuL4Iw8wpgUoT-CbNB6tkRJuDgijr",
    title: "Film 2",
    driveUrl:
      "https://drive.google.com/open?id=1ndGnuL4Iw8wpgUoT-CbNB6tkRJuDgijr&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1ndGnuL4Iw8wpgUoT-CbNB6tkRJuDgijr/preview",
  },
  {
    id: "1RiwaicHnortoymVBVU8dyc6_W7F_K6Cn",
    title: "Film 3",
    driveUrl:
      "https://drive.google.com/open?id=1RiwaicHnortoymVBVU8dyc6_W7F_K6Cn&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1RiwaicHnortoymVBVU8dyc6_W7F_K6Cn/preview",
  },
  {
    id: "1bstpC24GHe9-7wlAnE0uRBhD5YFAgIaX",
    title: "Film 4",
    driveUrl:
      "https://drive.google.com/open?id=1bstpC24GHe9-7wlAnE0uRBhD5YFAgIaX&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1bstpC24GHe9-7wlAnE0uRBhD5YFAgIaX/preview",
  },
  {
    id: "1qcYV-C4U5vnHB7_nGZ_ZR6JyWPzkwtVp",
    title: "Film 5",
    driveUrl:
      "https://drive.google.com/open?id=1qcYV-C4U5vnHB7_nGZ_ZR6JyWPzkwtVp&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1qcYV-C4U5vnHB7_nGZ_ZR6JyWPzkwtVp/preview",
  },
  {
    id: "1hkTnCHh-FI6EAjKKJTE3WvWj8NFKu1dG",
    title: "Film 6",
    driveUrl:
      "https://drive.google.com/open?id=1hkTnCHh-FI6EAjKKJTE3WvWj8NFKu1dG&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1hkTnCHh-FI6EAjKKJTE3WvWj8NFKu1dG/preview",
  },
  {
    id: "1X750UJnH33nD2PvNWb2I--iyMjRhpmDI",
    title: "Film 7",
    driveUrl:
      "https://drive.google.com/open?id=1X750UJnH33nD2PvNWb2I--iyMjRhpmDI&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1X750UJnH33nD2PvNWb2I--iyMjRhpmDI/preview",
  },
  {
    id: "1ME-zLbPkluqMqQRk3uWLBjX3vkQEuWT_",
    title: "Film 8",
    driveUrl:
      "https://drive.google.com/open?id=1ME-zLbPkluqMqQRk3uWLBjX3vkQEuWT_&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1ME-zLbPkluqMqQRk3uWLBjX3vkQEuWT_/preview",
  },
  {
    id: "1s3qaX8Z5baO81Blg-7vmrNvNw7NiMMgZ",
    title: "Film 9",
    driveUrl:
      "https://drive.google.com/open?id=1s3qaX8Z5baO81Blg-7vmrNvNw7NiMMgZ&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1s3qaX8Z5baO81Blg-7vmrNvNw7NiMMgZ/preview",
  },
  {
    id: "1MTsOmbR5VJ70kzUQDFuAQqjUUe0Jvg1g",
    title: "Film 10",
    driveUrl:
      "https://drive.google.com/open?id=1MTsOmbR5VJ70kzUQDFuAQqjUUe0Jvg1g&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1MTsOmbR5VJ70kzUQDFuAQqjUUe0Jvg1g/preview",
  },
  {
    id: "1B8i2er8-NZmrHlR8LABrr6NfSXyBjM3m",
    title: "Film 11",
    driveUrl:
      "https://drive.google.com/open?id=1B8i2er8-NZmrHlR8LABrr6NfSXyBjM3m&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1B8i2er8-NZmrHlR8LABrr6NfSXyBjM3m/preview",
  },
  {
    id: "1CJPYtD3lISbRXC9mcewHV-gYuKZ7UU-U",
    title: "Film 12",
    driveUrl:
      "https://drive.google.com/open?id=1CJPYtD3lISbRXC9mcewHV-gYuKZ7UU-U&usp=drive_copy",
    embedUrl:
      "https://drive.google.com/file/d/1CJPYtD3lISbRXC9mcewHV-gYuKZ7UU-U/preview",
  },
];

export default function VideosPage({ user }: UserDashboardProps) {
  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <div>
        <GlowingCircle />
        <GlowingCircle isRight={true} />
      </div>

      <div className="flex">
        <DashboardSidebar username={user.username} />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100">
                🎥 Filmy Edukacyjne
              </h1>
              <p className="text-neutral-400 mt-2">Oglądaj materiały wideo</p>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="bg-neutral-800/90 backdrop-blur-md border-neutral-600/80 hover:border-amber-600/50 transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-neutral-100 flex items-center justify-between">
                      <span className="flex items-center">
                        <Play className="mr-2 h-5 w-5 text-amber-500" />
                        {video.title}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-neutral-300">
                      Materiał wideo edukacyjny
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Video Preview */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900/50">
                      <iframe
                        src={video.embedUrl}
                        className="w-full h-full"
                        allow="autoplay"
                        allowFullScreen
                        title={video.title}
                      ></iframe>
                    </div>

                    {/* Open in Drive Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-neutral-700/50 hover:bg-neutral-700 text-neutral-100 border-neutral-600"
                      onClick={() => window.open(video.driveUrl, "_blank")}
                    >
                      Otwórz w Google Drive
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="-z-10">
        <DotPattern
          glow={false}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] opacity-20"
          )}
        />
      </div>

      <NoiseFilter className="-z-10" />
    </div>
  );
}
