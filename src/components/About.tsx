import styles from "./About.module.css";

// Small pixel effect drawn next to an image on hover ("." = transparent)
type Fx = { rows: string[]; palette: Record<string, string>; left: string; top: string; anim: string };

type Hobby = {
  name: string;
  src: string;          // pixel-art image in /public/hobbies
  w: number; h: number; // native size in pixels
  scale?: number;       // extra scale for small images, so they match the others
  rotate?: boolean;     // tilt 45° to the right
  color: string;
  fx: Fx;
};

const NOTES = ["..mm.", "..m.m", "..m..", "mmm..", "mm..."];
const FLASH = ["f.f.f", ".fff.", "fffff"];
const KERNELS = ["...ww.", "..wyyw", "...ww.", "ww....", "yw...."];
const STEAM = [".s..s.", "..s..s", ".s..s.", "..s..s"];

const HOBBIES: Hobby[] = [
  { name: "Guitar & Music", src: "/hobbies/guitar.png",  w: 15, h: 33, scale: 1.4, rotate: true, color: "var(--c1)",
    fx: { rows: NOTES,   palette: { m: "#1f2430" }, left: "-95%", top: "4%", anim: styles.rise } },
  { name: "Photography",    src: "/hobbies/camera.png",  w: 18, h: 15, scale: 1.7, color: "var(--c3)",
    fx: { rows: FLASH,   palette: { f: "#ffd23f" }, left: "-30%", top: "-38%", anim: styles.flash } },
  { name: "Movies",         src: "/hobbies/popcorn.png", w: 24, h: 17, scale: 1.4, color: "var(--c4)",
    fx: { rows: KERNELS, palette: { w: "#fff6dc", y: "#ffd23f" }, left: "38%", top: "-48%", anim: styles.pop } },
  { name: "Cooking",        src: "/hobbies/pan.png",     w: 24, h: 22, scale: 1.3, color: "var(--c2)",
    fx: { rows: STEAM,   palette: { s: "#ffffff" }, left: "14%", top: "-42%", anim: styles.rise } },
];

// One <rect> per horizontal run of same-coloured pixels
function Pixels({ rows, palette }: { rows: string[]; palette: Record<string, string> }) {
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== ".") rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={palette[ch]} />);
      x = end;
    }
  });
  return <>{rects}</>;
}

// The image is scaled by a whole pixel factor (--px, see the CSS) and drawn with
// image-rendering: pixelated, so it stays crisp pixel art at any size
function HobbyArt({ h }: { h: Hobby }) {
  const cols = h.fx.rows[0].length, rows = h.fx.rows.length;
  return (
    <span
      className={`${styles.art} ${h.rotate ? styles.rotated : ""}`}
      style={{ "--w": h.w, "--h": h.h, "--s": h.scale ?? 1 } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny pixel art, no optimisation wanted */}
      <img src={h.src} alt="" width={h.w} height={h.h} className={styles.img} />
      <svg
        viewBox={`0 0 ${cols} ${rows}`}
        shapeRendering="crispEdges"
        className={`${styles.fx} ${h.fx.anim}`}
        style={{ left: h.fx.left, top: h.fx.top, "--cols": cols } as React.CSSProperties}
      >
        <Pixels rows={h.fx.rows} palette={h.fx.palette} />
      </svg>
    </span>
  );
}

export default function About() {
  return (
    <section id="about" className={`container ${styles.about}`}>
      <p className="kicker"><b>04</b><span>About me</span></p>
      <div className="section-head">
        <h2 className="section-title">Get to know me  </h2>
      </div>

      <div className={styles.text}>
        <p className={styles.lead}>
          I'm Daniel, born and raised in Bratislava. I've been into tech since I was a kid, but it
          really took off when I got my first PC. Besides the obvious, games, I got curious about
          how digital systems actually work. I started learning and using all kinds of software, and
          before long I was building my own.
        </p>
        <p>
          What I still enjoy most is the moment when an idea turns into something that actually
          works. I love learning new things and putting them into practice right away. These days I
          split my time between studying at FIIT, keeping things running
          at Slovenská sporiteľňa, working on tech side projects and enjoying my hobbies.
        </p>

        <p>Check them out, maybe we have something in common:</p>
        <ul className={styles.hobbies}>
          {HOBBIES.map((h) => (
            <li key={h.name} className={styles.hobby}>
              <span className={styles.tile} style={{ "--c": h.color } as React.CSSProperties}>
                <HobbyArt h={h} />
              </span>
              <span className={styles.name}>{h.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
