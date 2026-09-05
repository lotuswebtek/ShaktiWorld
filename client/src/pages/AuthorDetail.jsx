import { Link, useParams } from 'react-router-dom'
import { authors } from '../data/site.js'
import NotFound from './NotFound.jsx'

export default function AuthorDetail() {
  const { slug } = useParams()
  const author = authors.find((item) => item.slug === slug)
  if (!author) return <NotFound />

  return (
    <section className="section">
      <div className="container detail">
        <img className="cover" src={author.image} alt={author.name} />
        <div className="detail-copy rich">
          <p className="kicker">{author.role}</p>
          <h1>{author.name}</h1>
          <p className="meta">{author.work}</p>
          {author.body.split('\n\n').map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
          <p style={{ marginTop: '1.8rem' }}>
            <Link className="btn btn-solid" to="/our-work">
              Back to our work
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
