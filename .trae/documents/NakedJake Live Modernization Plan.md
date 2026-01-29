# Project Modernization & Rebranding: NakedJake Live

## Phase 1: Dependency Audit & Update
- **Audit**: Identify all outdated and RC versions (Next.js 15 RC, React 19 RC).
- **Update**: Migrate to latest stable versions of:
  - `next` (v15 stable)
  - `react` / `react-dom` (v19 stable)
  - `@stream-io/video-react-sdk`
  - `@clerk/nextjs`
- **Cleanup**: Remove unused Google-specific assets and configurations.

## Phase 2: Rebranding to "NakedJake Live"
- **Metadata**: Update `package.json`, `README.md`, and SEO metadata in `layout.tsx`.
- **Text Replacement**: Global update of all "Moogle Meet" and "Google Meet" references to "NakedJake Live".
- **Asset Refresh**: Prepare for new logo and favicon integration.

## Phase 3: Visual Redesign (Black, White, Red, Grey)
- **Design System**: 
  - Overhaul `tailwind.config.ts` with a premium color palette (Black: #000000, White: #FFFFFF, Red: #E11D48, Grey: #1F2937).
  - Replace Google fonts with modern typography (e.g., Inter or Geist).
- **UI Components**: 
  - Redesign `Button`, `TextField`, and `Header` for a distinctive, premium aesthetic.
  - Implement glassmorphism and subtle animations for a modern feel.

## Phase 4: Iconography Update
- **Library Migration**: Replace custom SVGs with `lucide-react` for consistency and premium quality.
- **Consistency**: Ensure all meeting controls and navigation elements use the new icon set.
- **Icon Requirements**: Provide a detailed list of logo dimensions and formats (SVG, PNG, ICO).

## Phase 5: SDK Feature Enhancements
- **Advanced Audio**: Integrate Noise Suppression using Stream's latest hooks.
- **Call Management**: Add Recording and Live Transcription capabilities.
- **Engagement**: Implement real-time Reactions and Hand Raising.
- **Virtual Backgrounds**: Refine and optimize background blurring/replacement.

## Phase 6: Verification & Delivery
- **Testing**: Full functional audit of the meeting lifecycle (join, call, leave).
- **Performance**: Optimize for LCP and accessibility standards.
- **Documentation**: Provide a summary of all changes and a feature enhancement proposal.
