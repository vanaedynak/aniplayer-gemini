import fs from 'node:fs';
import path from 'node:path';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141824"/>
      <stop offset="50%" stop-color="#0B0D14"/>
      <stop offset="100%" stop-color="#07080D"/>
    </linearGradient>

    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>

    <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="40%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>

    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F472B6"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="blur"/>
    </filter>
  </defs>

  <!-- Background Squircle with Border -->
  <rect x="24" y="24" width="464" height="464" rx="116" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="8"/>

  <!-- Background Ambient Glow -->
  <circle cx="256" cy="256" r="140" fill="#8B5CF6" opacity="0.25" filter="url(#softGlow)"/>
  <circle cx="290" cy="240" r="100" fill="#EC4899" opacity="0.2" filter="url(#softGlow)"/>

  <!-- Central Anime Play Symbol -->
  <g filter="url(#glow)">
    <!-- Main Play Triangle with smooth corners -->
    <path d="M190 145 C190 135 202 128 211 134 L380 241 C389 247 389 261 380 267 L211 374 C202 380 190 373 190 363 Z"
          fill="url(#playGrad)"/>
    
    <!-- Neon Dynamic Wing / Accent Shard -->
    <path d="M190 145 L275 254 L190 285 Z" fill="white" opacity="0.25"/>
    <path d="M380 241 L275 254 L340 215 Z" fill="#F472B6" opacity="0.4"/>

    <!-- Anime Speed / Energy Cuts -->
    <path d="M155 180 L170 190 L160 215 Z" fill="url(#accentGrad)" opacity="0.8"/>
    <path d="M145 240 L165 250 L150 280 Z" fill="#60A5FA" opacity="0.8"/>
    <path d="M160 305 L175 315 L165 335 Z" fill="url(#accentGrad)" opacity="0.8"/>
  </g>

  <!-- Star Sparkle -->
  <g transform="translate(365, 120)">
    <path d="M0 -22 Q0 0 22 0 Q0 0 0 22 Q0 0 -22 0 Q0 0 0 -22 Z" fill="#FDF4FF" filter="url(#glow)"/>
  </g>
  <g transform="translate(130, 360)">
    <path d="M0 -12 Q0 0 12 0 Q0 0 0 12 Q0 0 -12 0 Q0 0 0 -12 Z" fill="#A855F7" opacity="0.8"/>
  </g>
</svg>`;

async function main() {
  const sharp = (await import('sharp')).default;
  const pngToIco = (await import('png-to-ico')).default;

  const publicDir = path.resolve('public');
  const buildDir = path.resolve('build');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

  const svgPath = path.join(publicDir, 'icon.svg');
  fs.writeFileSync(svgPath, svg, 'utf-8');

  // Generate 512x512 PNG
  const png512 = await sharp(Buffer.from(svg)).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon.png'), png512);
  fs.writeFileSync(path.join(buildDir, 'icon.png'), png512);

  // Generate 256, 128, 64, 48, 32, 16 PNGs for ICO
  const sizes = [256, 128, 64, 48, 32, 16];
  const pngBuffers = [];
  for (const s of sizes) {
    const buf = await sharp(Buffer.from(svg)).resize(s, s).png().toBuffer();
    pngBuffers.push(buf);
  }

  const icoBuf = await pngToIco(pngBuffers);
  fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuf);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuf);

  console.log('✓ Successfully generated icon.svg, icon.png, and icon.ico in public/ and build/!');
}

main().catch(console.error);
