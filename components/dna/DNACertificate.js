"use client";

import { useEffect, useRef } from "react";

export default function DNACertificate({ profile, keywordProfile }) {
  const canvasRef = useRef(null);

  /* ------------------------------------------------------------
     CANVAS HELIX
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = 3;

    const width = 350;
    const height = 700;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawHelix(ctx, width, height, helixKeywords);
  }, [keywordProfile]);

  function drawHelix(ctx, width, height, keywords) {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const amplitude = 50;
    const frequency = 0.02;
    const steps = 150;

    // Helix spheres
    for (let strand = 0; strand < 2; strand++) {
      const offset = strand * Math.PI;

      for (let i = 0; i < steps; i++) {
        const y = (i / steps) * height;
        const angle = i * frequency * Math.PI * 2 + offset;
        const x = centerX + Math.sin(angle) * amplitude;
        const z = Math.cos(angle);

        const size = 3.6 + z * 1.4;

        ctx.fillStyle = `hsla(${strand === 0 ? 320 : 260}, 90%, ${
          50 + z * 15
        }%, ${0.75 + z * 0.25})`;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bars
    for (let i = 0; i < steps; i += 3) {
      const y = (i / steps) * height;
      const a1 = i * frequency * Math.PI * 2;
      const a2 = a1 + Math.PI;

      const x1 = centerX + Math.sin(a1) * amplitude;
      const x2 = centerX + Math.sin(a2) * amplitude;
      const z = Math.cos(a1);

      ctx.strokeStyle = `rgba(232, 68, 153, ${0.25 + z * 0.3})`;
      ctx.lineWidth = 2.3;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }

    // Keywords
    const spacing = 35;
    const limit = Math.min(20, keywords.length);

    ctx.font = "600 12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < limit; i++) {
      const y = 30 + spacing * i;
      if (y > height - 30) break;

      ctx.shadowColor = "rgba(0,0,0,0.05)";
      ctx.shadowBlur = 2;
      ctx.fillStyle = "rgba(20,20,20,0.85)";

      ctx.fillText(keywords[i], centerX, y);
      ctx.shadowColor = "transparent";
    }
  }

  /* ------------------------------------------------------------
     DATA
  ------------------------------------------------------------ */
  const dnaCode = profile
    ? `DNA-${profile.id.slice(0, 3).toUpperCase()}-${
        keywordProfile?.total_keywords || 0
      }K`
    : "DNA-XXX-0K";

  const keywords = keywordProfile?.keywords || [];

  const helixKeywords = keywords
    .slice(0, 20)
    .map((k) => (typeof k === "string" ? k : k.keyword || k.name))
    .filter(Boolean);

  const badgeKeywords = keywords
    .slice(20, 45)
    .map((k) => (typeof k === "string" ? k : k.keyword || k.name))
    .filter(Boolean);

  /* ------------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */
  return (
    <div className="w-[1200px] h-[1700px] bg-white shadow-xl rounded-[40px] border border-gray-100 relative overflow-hidden mx-auto">
      {/* Clean base */}
      <div className="absolute inset-0 bg-white pointer-events-none"></div>

      <div className="relative z-10 px-20 py-14 flex flex-col justify-between h-full">
        {/* HEADER */}
        <header className="text-center mb-14">
          <img
            src="/light-logo.png"
            alt="OpenPools"
            className="h-14 w-auto mx-auto mb-3"
          />

          <div className="w-40 h-[3px] bg-gradient-to-r from-transparent via-primary-500 to-transparent mx-auto"></div>
        </header>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-16 mb-12">
          {/* LEFT */}
          <div>
            <h3 className="text-3xl font-semibold text-gray-800 text-center mb-8">
              This is to certify that
            </h3>

            {/* Profile photo */}
            <div className="w-40 h-40 mx-auto rounded-full p-[3px] bg-gradient-to-tr from-primary-300 to-purple-400 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <span className="text-5xl font-semibold text-primary-600">
                    {profile?.full_name?.[0] || "?"}
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="mt-6 text-center">
              <h2 className="text-[38px] font-semibold tracking-tight leading-tight">
                {profile?.full_name || "Your Name"}
              </h2>
              {profile?.job_title && (
                <p className="text-lg text-gray-700 mt-1">
                  {profile.job_title}{" "}
                  {profile.company && `at ${profile.company}`}
                </p>
              )}
            {/* DNA Badge */}
            <div className="text-center mt-8">
              <span className="inline-flex px-6 py-2.5 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-600 font-mono font-semibold tracking-wide">
                {dnaCode}
              </span>
            </div>
            </div>

            {/* Certificate statement */}
            <p className="text-lg text-gray-700 text-center mt-8 italic leading-relaxed max-w-[700px] mx-auto">
              has been formally recognized for demonstrating a consistently high
              level of professional competence across multiple verified domains.
              Their contributions, skill depth, and collaborative potential have
              positioned them as a distinguished member within the OpenPools
              Network, reflecting both technical excellence and a commitment to
              continuous growth.
            </p>

          </div>

          {/* RIGHT: HELIX */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-4">
              Professional DNA Signals
            </h3>
            <canvas
              ref={canvasRef}
              style={{
                filter: "drop-shadow(0 0 20px rgba(232, 68, 153, 0.2))",
              }}
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-5xl font-semibold text-primary-600">
              {keywordProfile?.total_keywords || 0}
            </div>
            <div className="text-xs tracking-wide text-gray-600 mt-2 uppercase">
              Verified Skills
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-5xl font-semibold text-purple-600">
              {profile?.created_at
                ? Math.floor(
                    (new Date() - new Date(profile.created_at)) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0}
            </div>
            <div className="text-xs tracking-wide text-gray-600 mt-2 uppercase">
              Days Active
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-5xl font-semibold text-[#E84499]">
              {keywordProfile?.keywords
                ? Math.floor(keywordProfile.keywords.length / 10) * 10 + 10
                : 90}
              %
            </div>
            <div className="text-xs tracking-wide text-gray-600 mt-2 uppercase">
              Uniqueness
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 uppercase tracking-wide text-center mb-4">
            Additional Verified Skills & Expertise
          </h3>

          <div className="max-w-[900px] mx-auto flex flex-wrap justify-center gap-2">
            {badgeKeywords.map((keyword, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gradient-to-r from-primary-500/15 to-purple-500/15 border border-primary-500/30 rounded-full text-xs font-semibold text-primary-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-8 border-t border-gray-200 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Verified by</span>

            <img src="/light-logo.png" className="h-5 w-auto" />

            <span className="text-gray-500">•</span>
            <span className="text-gray-600">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="font-mono text-gray-500 text-xs">
            openpools.in/dna/{profile?.username || profile?.id?.slice(0, 8)}
          </div>
        </footer>
      </div>
    </div>
  );
}
