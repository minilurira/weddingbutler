/**
 * 축의대 현장을 그린 일러스트 모음.
 *
 * 왜 사진이 아니라 그림인가
 * ─────────────────────────
 * 축의대 대행은 아직 사례 사진이 없고, 스톡 사진에는 "한국 결혼식 접수대"
 * 장면이 사실상 없습니다. 어울리지 않는 외국 웨딩 사진을 억지로 끼워 넣는
 * 대신, 서비스가 실제로 하는 일(봉투 접수·방명록·보관함·정산)을 그대로
 * 그렸습니다.
 *
 * 덤으로 얻는 것
 *  - 외부 요청이 없어 항상 즉시 뜹니다. 깨질 일이 없습니다.
 *  - 저작권·출처 표기 문제가 없습니다.
 *  - 브랜드 색을 그대로 씁니다. 색을 바꾸면 그림 색도 따라 바뀝니다.
 *  - 파일 크기가 사진의 100분의 1 수준입니다.
 *
 * 나중에 실제 예식 사진이 생기면 src/lib/images.ts 에 주소만 넣으면
 * 사진이 이 그림을 대체합니다. (사진이 안 뜨면 다시 이 그림으로 돌아옵니다)
 *
 * 인물은 얼굴 없는 실루엣으로 그렸습니다. 특정한 사람처럼 보이지 않게
 * 하려는 의도이고, 담백한 인상도 함께 노립니다.
 */

export type SceneName =
  | "reception" // 접수대 전경 — 버틀러 2명이 접수대를 지키는 장면
  | "desk" // 접수대 위 클로즈업 — 방명록·봉투·보관함
  | "butlers" // 버틀러 2인 정면
  | "queue" // 봉투를 든 하객들이 줄 선 모습
  | "flowers"; // 플로럴 디테일

type Variant = "dark" | "light";

type Palette = {
  bg: string;
  bgAlt: string;
  glow: string;
  figure: string;
  figureAlt: string;
  accent: string;
  accentSoft: string;
  paper: string;
  paperDim: string;
  lineOn: string;
};

const PALETTE: Record<Variant, Palette> = {
  dark: {
    /* 인물을 또렷하게 세우려면 바탕이 인물보다 밝아야 한다.
       그래서 어두운 장면이라도 바탕은 중간 톤으로 둔다. */
    bg: "#4c3742",
    bgAlt: "#614654",
    glow: "#f0aebd",
    figure: "#2c1e25",
    figureAlt: "#3d2b34",
    accent: "#f0aebd",
    accentSoft: "#d18a9e",
    paper: "#fff7f9",
    paperDim: "#e9d2da",
    lineOn: "#b0768a",
  },
  light: {
    bg: "#fdeef2",
    bgAlt: "#fadde4",
    glow: "#f5bfcd",
    figure: "#3b2932",
    figureAlt: "#5b414d",
    accent: "#b0546c",
    accentSoft: "#eda5b7",
    paper: "#ffffff",
    paperDim: "#f7e6ea",
    lineOn: "#dcb9c4",
  },
};

/* ── 그림 조각들 ────────────────────────────────────────────────────── */

/**
 * 얼굴 없는 상반신.
 *
 * 어깨를 반원으로 그리면 머리와 붙어 묘비처럼 보인다. 그래서 어깨는
 * 납작한 타원 호로 그리고, 어깨와 머리 사이에 목이 드러나는 빈 구간을
 * 남겼다. 작게 줄여도 사람으로 읽히게 하기 위한 것이다.
 *
 * 좌표는 발밑(y=0) 기준이며 전체 높이는 약 139이다.
 */
function Butler({
  x,
  y,
  scale = 1,
  p,
  tie = true,
  holdsEnvelope = false,
  envelopeSide = "right",
}: {
  x: number;
  y: number;
  scale?: number;
  p: Palette;
  /** 나비넥타이(포인트 색) 표시 여부 */
  tie?: boolean;
  /** 봉투를 손에 든 모습 */
  holdsEnvelope?: boolean;
  /** 봉투를 어느 쪽 손에 들지. 옆 사람에게 가리지 않도록 바깥쪽으로 뺀다. */
  envelopeSide?: "left" | "right";
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* 몸통 — 어깨를 납작하게 */}
      <path d="M-60 0 v-40 a60 32 0 0 1 120 0 V0 Z" fill={p.figure} />

      {/* 셔츠와 재킷 깃 */}
      <path d="M-18 -66 L0 -34 L18 -66 Z" fill={p.paper} />
      <path d="M-18 -66 L0 -34 L-34 -54 Z" fill={p.figureAlt} />
      <path d="M18 -66 L0 -34 L34 -54 Z" fill={p.figureAlt} />
      {tie && <circle cx="0" cy="-60" r="7" fill={p.accent} />}

      {/* 목 — 어깨와 머리를 갈라놓는 구간 */}
      <rect x="-11" y="-88" width="22" height="24" rx="8" fill={p.figureAlt} />

      {/* 머리 */}
      <circle cx="0" cy="-112" r="27" fill={p.figureAlt} />
      <path
        d="M-27 -114 a27 27 0 0 1 54 0 a27 19 0 0 0 -54 0 Z"
        fill={p.figure}
      />

      {holdsEnvelope && (
        <g
          transform={`translate(${envelopeSide === "left" ? -54 : 54} -30) rotate(${envelopeSide === "left" ? 12 : -12})`}
        >
          <rect x="-26" y="-17" width="52" height="34" rx="3" fill={p.paper} />
          <path d="M-26 -17 L0 3 L26 -17 Z" fill={p.paperDim} />
        </g>
      )}
    </g>
  );
}

/** 봉투. 축의금 봉투를 뜻하는 이 서비스의 핵심 소품이다. */
function Envelope({
  x,
  y,
  w = 92,
  rotate = 0,
  p,
  band = true,
}: {
  x: number;
  y: number;
  w?: number;
  rotate?: number;
  p: Palette;
  band?: boolean;
}) {
  const h = w * 0.66;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={w * 0.06}
        fill={p.paper}
      />
      {/* 봉투 덮개 */}
      <path
        d={`M${-w / 2} ${-h / 2} L0 ${h * 0.12} L${w / 2} ${-h / 2} Z`}
        fill={p.paperDim}
      />
      {band && (
        <rect
          x={-w * 0.1}
          y={-h / 2}
          width={w * 0.2}
          height={h}
          fill={p.accent}
          opacity="0.85"
        />
      )}
    </g>
  );
}

/** 펼친 방명록 */
function GuestBook({ x, y, p }: { x: number; y: number; p: Palette }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-110 0 q55 -22 108 -4 q53 -18 108 4 l0 14 q-55 -20 -108 -2 q-53 -18 -108 2 Z"
        fill={p.paperDim}
      />
      <path d="M-108 -2 q55 -22 106 -4 v-46 q-51 -16 -106 6 Z" fill={p.paper} />
      <path d="M108 -2 q-55 -22 -106 -4 v-46 q51 -16 106 6 Z" fill={p.paper} />
      {/* 적어 내려간 이름들 */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={-92}
            y={-44 + i * 13}
            width={64}
            height={4}
            rx={2}
            fill={p.lineOn}
            opacity="0.75"
          />
          <rect
            x={28}
            y={-46 + i * 13}
            width={64}
            height={4}
            rx={2}
            fill={p.lineOn}
            opacity="0.75"
          />
        </g>
      ))}
      {/* 펜 */}
      <g transform="translate(66 -66) rotate(38)">
        <rect x="-4" y="-34" width="8" height="58" rx="4" fill={p.figure} />
        <path d="M-4 24 L4 24 L0 36 Z" fill={p.accent} />
      </g>
    </g>
  );
}

/** 잠금 보관함 — 받은 축의금을 바로 옮겨 담는 곳 */
function LockBox({ x, y, p }: { x: number; y: number; p: Palette }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-58" y="-72" width="116" height="72" rx="9" fill={p.figure} />
      <rect x="-58" y="-72" width="116" height="17" rx="8" fill={p.figureAlt} />
      {/* 투입구 */}
      <rect x="-24" y="-66" width="48" height="6" rx="3" fill={p.bg} />
      {/* 자물쇠 */}
      <circle cx="0" cy="-34" r="13" fill={p.accent} />
      <rect x="-3" y="-34" width="6" height="13" rx="3" fill={p.figure} />
    </g>
  );
}

/** 꽃 한 송이 */
function Flower({
  x,
  y,
  r = 15,
  p,
  petals = 6,
}: {
  x: number;
  y: number;
  r?: number;
  p: Palette;
  petals?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy={-r}
          rx={r * 0.52}
          ry={r}
          fill={p.accentSoft}
          transform={`rotate(${(360 / petals) * i})`}
          opacity="0.9"
        />
      ))}
      <circle cx="0" cy="0" r={r * 0.42} fill={p.paper} />
    </g>
  );
}

/** 접수대 (상판 + 앞면 천) */
function Desk({
  x,
  y,
  width,
  height,
  p,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  p: Palette;
}) {
  const half = width / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* 앞면 천 */}
      <path
        d={`M${-half + 22} 20 h${width - 44} v${height - 20} q${-half + 22} 26 ${-(width - 44)} 0 Z`}
        fill={p.bgAlt}
      />
      {[-1, 0, 1].map((i) => (
        <rect
          key={i}
          x={i * (width / 5) - 2}
          y={26}
          width="4"
          height={height - 34}
          fill={p.bg}
          opacity="0.35"
        />
      ))}
      {/* 상판 */}
      <rect
        x={-half}
        y={-8}
        width={width}
        height="28"
        rx="14"
        fill={p.paper}
      />
      <rect
        x={-half}
        y={8}
        width={width}
        height="12"
        rx="6"
        fill={p.paperDim}
      />
    </g>
  );
}

/** 떠다니는 꽃잎 */
function Petals({ p, seed = 0 }: { p: Palette; seed?: number }) {
  const spots = [
    [140, 150],
    [340, 90],
    [520, 210],
    [980, 130],
    [1220, 240],
    [1420, 110],
    [760, 70],
    [1100, 330],
  ];
  return (
    <g opacity="0.55">
      {spots.map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy + ((i + seed) % 3) * 14}
          rx={7 + (i % 3) * 2}
          ry={4 + (i % 2) * 2}
          fill={p.accent}
          transform={`rotate(${(i * 37) % 90} ${cx} ${cy})`}
          opacity={0.35 + (i % 4) * 0.12}
        />
      ))}
    </g>
  );
}

/* ── 장면들 ─────────────────────────────────────────────────────────── */

function SceneReception({ p, id }: { p: Palette; id: string }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="26%" r="62%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.26" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill={p.bg} />
      <rect width="1600" height="900" fill={`url(#${id}-glow)`} />

      {/* 예식장 뒤편 아치 — 버틀러가 이 위에 실루엣으로 선다 */}
      {[300, 800, 1300].map((cx, i) => (
        <path
          key={cx}
          d={`M${cx - 155} 720 V360 a155 155 0 0 1 310 0 V720 Z`}
          fill={p.bgAlt}
          opacity={i === 1 ? 0.95 : 0.7}
        />
      ))}

      <Petals p={p} />

      {/* 접수대를 지키는 버틀러 두 명 */}
      <Butler x={600} y={700} scale={1.05} p={p} />
      <Butler x={1010} y={700} scale={1.05} p={p} tie={false} />

      {/* 접수대 */}
      <Desk x={800} y={700} width={1300} height={200} p={p} />

      {/* 상판 위 물건들 */}
      <GuestBook x={410} y={692} p={p} />
      <g transform="translate(800 676)">
        <Envelope x={-34} y={6} w={96} rotate={-7} p={p} />
        <Envelope x={22} y={-6} w={96} rotate={5} p={p} />
      </g>
      <LockBox x={1190} y={692} p={p} />
      <g transform="translate(1370 692)">
        <rect x="-26" y="-56" width="52" height="56" rx="8" fill={p.paperDim} />
        <Flower x={-14} y={-74} r={15} p={p} />
        <Flower x={16} y={-82} r={13} p={p} />
        <Flower x={2} y={-98} r={11} p={p} />
      </g>
    </svg>
  );
}

function SceneDesk({ p, id }: { p: Palette; id: string }) {
  /** 상판의 높이. 물건들이 화면 가운데쯤 오도록 위쪽에 둔다. */
  const top = 250;

  return (
    <svg
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-pool`} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.26" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="520" fill={p.bg} />
      <rect width="1200" height="520" fill={`url(#${id}-pool)`} />

      {/* 테이블 앞면과 상판 */}
      <rect y={top + 12} width="1200" height={520 - top} fill={p.figureAlt} />
      <rect y={top} width="1200" height="18" rx="9" fill={p.paperDim} />

      {/* 상판 위 물건들 — 기준선을 상판에 맞춘다 */}
      <GuestBook x={330} y={top + 4} p={p} />

      <Envelope x={640} y={top - 28} w={112} rotate={-14} p={p} />
      <Envelope x={718} y={top - 22} w={112} rotate={-3} p={p} />
      <Envelope x={794} y={top - 28} w={112} rotate={9} p={p} />

      <LockBox x={1010} y={top + 4} p={p} />

      <Flower x={148} y={top - 66} r={20} p={p} />
      <Flower x={194} y={top - 38} r={15} p={p} />
      <Flower x={108} y={top - 32} r={13} p={p} />

      {/* 테이블 앞면의 은은한 주름 */}
      {[240, 600, 960].map((x) => (
        <rect
          key={x}
          x={x}
          y={top + 30}
          width="3"
          height={520 - top - 30}
          fill={p.bg}
          opacity="0.28"
        />
      ))}
    </svg>
  );
}

function SceneButlers({ p, id }: { p: Palette; id: string }) {
  return (
    <svg
      viewBox="0 0 900 700"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-halo`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.32" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="900" height="700" fill={p.bg} />
      <circle cx="450" cy="320" r="215" fill={p.bgAlt} />
      <rect width="900" height="700" fill={`url(#${id}-halo)`} />

      {/* 바닥 그림자 — 인물이 떠 보이지 않게 */}
      <ellipse cx="450" cy="628" rx="300" ry="24" fill={p.bgAlt} opacity="0.85" />

      <Butler x={352} y={630} scale={2.35} p={p} holdsEnvelope envelopeSide="left" />
      <Butler x={572} y={636} scale={2.15} p={p} tie={false} />

      <Petals p={p} seed={1} />
    </svg>
  );
}

function SceneQueue({ p, id }: { p: Palette; id: string }) {
  /*
   * 세로로 긴 자리에도, 가로로 넓은 자리에도 들어간다.
   * 그래서 정사각 화면에 주인공을 가운데로 모아 그린다. 어느 쪽이 잘려도
   * "접수대 앞에 선 하객" 이라는 뜻이 남는다.
   */
  return (
    <svg
      viewBox="0 0 900 900"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-halo`} cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.3" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="900" height="900" fill={p.bg} />
      <circle cx="450" cy="340" r="230" fill={p.bgAlt} opacity="0.9" />
      <rect width="900" height="900" fill={`url(#${id}-halo)`} />

      {/* 접수대를 지키는 버틀러 */}
      <Butler x={450} y={620} scale={1.75} p={p} />

      {/* 접수대 */}
      <Desk x={450} y={620} width={760} height={280} p={p} />

      {/* 상판 위 — 방명록과 봉투 */}
      <g transform="translate(0 -8)">
        <Envelope x={300} y={598} w={78} rotate={-8} p={p} />
        <Envelope x={392} y={594} w={78} rotate={4} p={p} />
      </g>

      {/* 접수대 앞에 선 하객 둘 — 뒤쪽은 작고 흐리게 */}
      <g opacity="0.55">
        <Butler
          x={196}
          y={780}
          scale={1.55}
          p={p}
          tie={false}
          holdsEnvelope
          envelopeSide="left"
        />
      </g>
      <Butler
        x={686}
        y={820}
        scale={1.85}
        p={p}
        tie={false}
        holdsEnvelope
      />
    </svg>
  );
}

function SceneFlowers({ p, id }: { p: Palette; id: string }) {
  return (
    <svg
      viewBox="0 0 900 700"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="presentation"
    >
      <defs>
        <radialGradient id={`${id}-soft`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={p.glow} stopOpacity="0.24" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="900" height="700" fill={p.bg} />
      <rect width="900" height="700" fill={`url(#${id}-soft)`} />

      {/* 아치 */}
      <path
        d="M180 640 V330 a270 270 0 0 1 540 0 V640"
        fill="none"
        stroke={p.bgAlt}
        strokeWidth="26"
        strokeLinecap="round"
      />

      {/* 아치를 타고 오른 꽃 */}
      {[
        [206, 470, 20],
        [232, 380, 15],
        [300, 268, 22],
        [400, 208, 17],
        [510, 206, 21],
        [610, 268, 15],
        [676, 380, 20],
        [700, 476, 14],
      ].map(([x, y, r], i) => (
        <Flower key={i} x={x} y={y} r={r} p={p} petals={i % 2 ? 5 : 6} />
      ))}

      {/* 바닥 */}
      <rect y="636" width="900" height="64" fill={p.bgAlt} />
    </svg>
  );
}

const SCENES: Record<
  SceneName,
  (props: { p: Palette; id: string }) => React.ReactElement
> = {
  reception: SceneReception,
  desk: SceneDesk,
  butlers: SceneButlers,
  queue: SceneQueue,
  flowers: SceneFlowers,
};

export function Illustration({
  scene,
  variant = "light",
  className = "",
}: {
  scene: SceneName;
  variant?: Variant;
  className?: string;
}) {
  const Scene = SCENES[scene];
  const palette = PALETTE[variant];
  // 같은 장면이 한 화면에 두 번 나와도 gradient id 가 겹치지 않게 한다.
  const id = `${scene}-${variant}`;

  return (
    <div
      className={`h-full w-full ${className}`}
      style={{ backgroundColor: palette.bg }}
    >
      <Scene p={palette} id={id} />
    </div>
  );
}
