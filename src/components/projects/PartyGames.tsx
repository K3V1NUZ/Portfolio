import Carousel, { type Slide } from "../Carousel";
import styles from "../ProjectModal.module.css";

// Case study for Party Games (repo: PartyPop). Facts come from the project's README and code.

// Screenshots, 16:10 (1600 × 1000). `browser` puts the browser bar on top (its text is the address).
// Slides without `src` show a striped placeholder: drop the image into /public/projects and add `src`.
const SLIDES: Slide[] = [
  { src: "/projects/party-games-lobby.png", alt: "Lobby on the host screen: QR code, room code GSXS, eight players and the scoreboard", browser: "192.168.2.207:5173/host/GSXS" },
  { src: "/projects/project-four-desktop.webp", alt: "Space Clash: ships, asteroids and player names", browser: "192.168.2.207:5173/host/GSXS" },
  { src: "/projects/party-games-turbo-track.png", alt: "Turbo Track: eight cars racing around a corner with tyre marks", browser: "192.168.2.207:5173/host/GSXS" },
  { alt: "Game picker" },
  { alt: "Results podium", browser: "192.168.2.207:5173/host/GSXS" },
];

// Gameplay clip shown above "The games". Set `gif` (an image) or `video` (short muted mp4 / webm);
// with neither, a placeholder shows.
const DEMO: { gif?: string; video?: string; alt: string } = {
  alt: "Gameplay: phones as controllers, the game on the big screen",
};

export default function PartyGames() {
  return (
    <>
      <section>
        <p className={styles.lead}>
          A Jackbox-style party platform that runs in the browser. One screen, a TV or laptop, shows the
          game. Everyone else scans a QR code and their <b>phone becomes the controller</b>. No apps, no
          accounts, just the same Wi-Fi.
        </p>
        <Carousel slides={SLIDES} />
      </section>

      <div className={styles.stats}>
        <div><b>Solo</b><span>design, front end and server</span></div>
        <div><b>~1 week</b><span>first playable, Oct 2026</span></div>
        <div><b>2–8</b><span>players per room</span></div>
        <div><b>0</b><span>installs or accounts needed</span></div>
      </div>

      <section>
        <h3>How it works</h3>
        <p>
          The server is the single source of truth. It runs every game loop and sends each side only what
          it needs: the big screen gets the full scene, each phone gets just its own state (ammo, power-ups,
          place). Phones send back small inputs that are validated before they touch the game.
        </p>
        <div className={styles.flow} role="img" aria-label="Phones send inputs to the game server, which sends each phone its own view and the big screen the host view. Both sides share types from packages/shared.">
          <div className={styles.node}><b>Phones</b><span>controllers<br />/play/:code</span></div>
          <div className={styles.arrow}><span>inputs</span><i>⇄</i><span>own view</span></div>
          <div className={`${styles.node} ${styles.core}`}><b>Game server</b><span>Express + Socket.IO<br />rooms · game loops · scoring</span></div>
          <div className={styles.arrow}><span>host view</span><i>→</i><span>events</span></div>
          <div className={styles.node}><b>Big screen</b><span>React host app<br />/host/:code</span></div>
          <div className={styles.shared}><b>packages/shared</b> · typed socket events, Zod input schemas and game contracts used by both sides</div>
        </div>
      </section>

      <section>
        <h3>The challenge</h3>
        <div className={styles.challenges}>
          <div>
            <b>Eight phones, one Wi-Fi</b>
            <p>Real-time games over home Wi-Fi lag and jitter, and every phone has to feel instant. Keeping all state on the server, sending each phone only its own small view, and marking big-screen physics updates as <b>volatile</b> means a slow screen drops a frame instead of falling behind.</p>
          </div>
        </div>
      </section>

      <section>
        <h3>Engineering highlights</h3>
        <ul className={styles.list}>
          <li><span><b>Server-authoritative and validated:</b> phones can only send schema-checked inputs, so nobody can cheat by editing the page.</span></li>
          <li><span><b>Typed end to end:</b> a pnpm monorepo where server and client share one contract per game. TypeScript flags any registry you forget.</span></li>
          <li><span><b>A small game framework:</b> a new game is three modules. Rooms, timers, scoring, reconnects and the results podium come for free.</span></li>
          <li><span><b>Tested with bots:</b> scripted bots play every game against an in-process server, plus lobby tests over real sockets.</span></li>
        </ul>
      </section>

      <figure className={styles.demo}>
        {DEMO.video ? (
          <video src={DEMO.video} autoPlay muted loop playsInline aria-label={DEMO.alt} />
        ) : DEMO.gif ? (
          // eslint-disable-next-line @next/next/no-img-element -- animated gif, no optimisation wanted
          <img src={DEMO.gif} alt={DEMO.alt} />
        ) : (
          <div className={styles.demoPh}>Gameplay video / GIF<br />coming soon</div>
        )}
      </figure>

      <section>
        <h3>The games</h3>
        <div className={styles.games}>
          <div><b>💥 Bumper Arena</b><span>Knock rivals off a shrinking arena, 30 Hz physics.</span><small>Joystick + dash</small></div>
          <div><b>🏎️ Turbo Track</b><span>Laps on a track with a bridge.</span><small>Joystick + gas pedal</small></div>
          <div><b>🚀 Space Clash</b><span>Ships always fly forward. Asteroids and power-ups.</span><small>Shoot + turn</small></div>
        </div>
        <p>
          Around the games sits a lobby where the first player becomes the <b>party leader</b> and their
          phone turns into a remote for the big screen, plus a ready-up countdown and a scoreboard.
        </p>
      </section>

      <section>
        <h3>What I learned</h3>
        <ul className={styles.list}>
          <li><span><b>Real-time networking:</b> what to send, how often, and what to do when a connection hiccups.</span></li>
          <li><span><b>Designing for reuse:</b> building the framework first made the second and third game far quicker than the first.</span></li>
          <li><span><b>Testing things that move:</b> bots and a simulated clock catch bugs that clicking around never would.</span></li>
        </ul>
        <p><b>Next up:</b> teams and tournaments, player avatars, and playing online instead of only on the same Wi-Fi.</p>
      </section>
    </>
  );
}
