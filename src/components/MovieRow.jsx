import MovieCard from "./MovieCard";

const MovieRow = ({ title, items, onItemClick, columns }) => {
  const displayItems = items ? items.slice(0, 24) : [];

  if (displayItems.length === 0) {
    return null;
  }

  const gridClass = columns ? `cols-${columns}` : "";

  return (
    <section className="row">
      <div className="row-header">
        <h2>{title}</h2>
      </div>
      <div className={`grid-container ${gridClass}`}>
        {displayItems.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default MovieRow;
