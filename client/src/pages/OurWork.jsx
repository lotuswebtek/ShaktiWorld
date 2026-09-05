import { Link } from 'react-router-dom'
import { authors } from '../data/site.js'

export default function OurWork() {
  return (
    <>
      <section className="page-hero">
        <img src="/images/work-voices.jpeg" alt="Empowering creative voices" />
        <div className="page-hero-copy">
          <p className="kicker">Our work</p>
          <h1>Empowerment through story, skill, and sisterhood</h1>
          <p>
            At Shaktiworld, our work is centered on the empowerment and elevation of women within
            creative and administrative fields. We believe in the transformative power of
            storytelling, collaboration, and shared experiences to drive professional and personal
            growth.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container work-blocks">
          <article className="work-block">
            <img src="/images/work-voices.jpeg" alt="Creative voices" />
            <div className="copy">
              <p className="kicker">Empowering creative voices</p>
              <h2>A platform for women’s work</h2>
              <p className="lede">
                We provide a platform dedicated to amplifying women’s voices across diverse creative
                disciplines. By celebrating unique perspectives and lived experiences, we foster an
                environment where creative potential is recognized and nurtured.
              </p>
            </div>
          </article>

          <article className="work-block">
            <img src="/images/work-community.jpeg" alt="Inclusive community" />
            <div className="copy">
              <p className="kicker">Building inclusive communities</p>
              <h2>Safe space. Shared growth.</h2>
              <p className="lede">
                A core pillar of our work is the creation of safe, inclusive, and empowering spaces.
                We facilitate connection and collaboration among women, ensuring that every member
                has the support needed to thrive in their respective industries.
              </p>
            </div>
          </article>

          <article className="work-block">
            <img src="/images/work-featuring.png" alt="Skill development" />
            <div className="copy">
              <p className="kicker">Skill development & growth</p>
              <h2>Connection. Collaboration. Advancement.</h2>
              <p className="lede">
                We are committed to the continuous growth of our community. Our initiatives focus on
                linking talented professionals with mentors and peers, encouraging joint projects
                and shared knowledge, and providing resources that help women step into the
                professional world with confidence and high-level skills.
              </p>
            </div>
          </article>

          <article className="work-block">
            <img src="/images/work-impact.jpg" alt="Cultural community impact" />
            <div className="copy">
              <p className="kicker">Cultural & community impact</p>
              <h2>Heritage, celebration, divine strength</h2>
              <p className="lede">
                Beyond professional development, we engage in meaningful community events like
                Shakti Day. These gatherings celebrate our heritage—such as honoring the sacred
                Gaumata—and bring people together to celebrate the nurturing power and divine
                strength found in all women.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <p className="kicker">Featured authors on Shaktiworld</p>
          <h2>Voices we celebrate</h2>
          <p className="lede">
            Meet the writers and creators whose work lives at the heart of our community.
          </p>
          <div className="card-grid two" style={{ marginTop: '2.4rem' }}>
            {authors.map((author) => (
              <Link className="media-card" key={author.slug} to={`/our-work/${author.slug}`}>
                <img src={author.image} alt={author.name} />
                <div className="body">
                  <span className="meta">{author.role}</span>
                  <h3>{author.name}</h3>
                  <p>{author.excerpt}</p>
                  <span className="link-more">Read profile</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
