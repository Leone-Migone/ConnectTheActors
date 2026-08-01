const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w300";

function GraphCard({ node }) {
  return (
    <article className={`graph-card graph-card--${node.type}`}>
      {node.image_path ? (
        <img
          className="graph-card__image"
          src={`${TMDB_IMAGE_BASE_URL}${node.image_path}`}
          alt={node.name}
        />
      ) : (
        <div className="graph-card__placeholder">
          No image
        </div>
      )}

      <div className="graph-card__content">
        <strong>{node.name}</strong>

        <span>
          {node.type === "actor" ? "Actor" : "Movie"}
        </span>
      </div>
    </article>
  );
}

export default GraphCard;