import { Link } from 'react-router-dom'
import { pillars, site, whatWeDo } from '../data/site.js'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/images/about-women.jpg" alt="Women gathered in community" />
        </div>
        <div className="hero-content">
          <span className="eyebrow">A movement of the divine feminine</span>
          <h1>Shaktiworld</h1>
          <div className="gold-rule" />
          <p>{site.tagline}</p>
          <div className="hero-actions">
            <Link className="btn btn-gold" to="/register">
              Join the movement
            </Link>
            <Link className="btn btn-outline" to="/our-work">
              Explore our work
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <p className="kicker">About us</p>
            <h2>Where women’s stories come alive</h2>
            <div className="lede rich">
              <p>
                Shaktiworld is a vibrant platform dedicated to showcasing women writers, creators,
                and storytellers from around the world. Rooted in the concept of the divine feminine
                lineage, we exist to honor, amplify, and celebrate the voices that have long been
                unheard, overlooked, or underestimated.
              </p>
              <p>
                We believe that every woman carries a story, a vision, and a creative force that
                deserves to be seen and valued. Shaktiworld is where those stories come alive.
              </p>
            </div>
          </div>
          <div className="split-image">
            <img src="/images/hero-women.jpeg" alt="Joyful women friends outdoors" />
          </div>
        </div>
        <div className="container pillars">
          {pillars.map((item) => (
            <article className="pillar" key={item.title}>
              <span className="eyebrow">{item.title}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-cream">
        <div className="container why-grid">
          <div>
            <p className="kicker">Our vision</p>
            <h2>Seen. Heard. Empowered.</h2>
            <p className="lede">
              To build a global community where women feel seen, heard, and empowered to express
              themselves freely—through words, art, design, and all forms of creative expression.
            </p>
            <p className="lede">
              This mission aims to amplify women’s voices across creative disciplines by celebrating
              diverse perspectives and lived experiences. By creating a safe, inclusive, and
              empowering space, it encourages meaningful collaboration and connection. Ultimately,
              these efforts foster a culture of sustained growth and professional development for
              women within the creative community.
            </p>
          </div>
          <div className="quote-card">
            <p>
              “Because representation matters. Because stories shape the world. Because when women
              support women, powerful things happen.”
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split reverse">
          <div className="split-image">
            <img src="/images/work-community.jpeg" alt="Women creating together" />
          </div>
          <div>
            <p className="kicker">What we do</p>
            <h2>More than a platform — a movement</h2>
            <div className="do-list">
              {whatWeDo.map((item, index) => (
                <div className="do-item" key={item}>
                  <span className="do-num">0{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
            <div className="chip-row">
              <span className="chip">Your voice is valued</span>
              <span className="chip">Your creativity is celebrated</span>
              <span className="chip">Your story matters</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-burgundy">
        <div className="container cta-panel">
          <p className="kicker">Join the movement</p>
          <h2>By women, for women</h2>
          <p>
            Whether you’re a writer, artist, designer, thinker, or dreamer—this is your space. Join
            us. Share your story. Collaborate. Inspire. Together, let’s manifest a world where
            women’s voices are not just heard—but celebrated.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-gold" to="/register">
              Be a part of Shaktiworld
            </Link>
            <Link className="btn btn-outline" to="/contact-us">
              Create. Connect. Empower.
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
