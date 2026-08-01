import { Handle, Position } from "@xyflow/react";

const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w300";

function ActorMovieNode({ data }) {
  return (
    <article className={`flow-node flow-node--${data.type}`}>
      <Handle
        type="target"
        position={Position.Left}
      />

      {data.imagePath ? (
        <img
          className="flow-node__image"
          src={`${TMDB_IMAGE_BASE_URL}${data.imagePath}`}
          alt={data.name}
        />
      ) : (
        <div className="flow-node__placeholder">
          No image
        </div>
      )}

      <div className="flow-node__content">
        <strong>{data.name}</strong>

        <span>
          {data.type === "actor" ? "Actor" : "Movie"}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
      />
    </article>
  );
}

export default ActorMovieNode;