// similarity score is based on Jaccard similarity index where Formula: Jaccard = |A ∩ B| / |A ∪ B|
function computeJaccard(setA, setB) {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = [...a].filter((x) => b.has(x));
  const union = new Set([...a, ...b]);
  const jaccard = union.size === 0 ? 0 : intersection.length / union.size;

  return {
    intersectionIds: intersection,
    intersectionCount: intersection.length,
    unionCount: union.size,
    jaccard,
  };
}

function mapIdsToNames(ids, top100) {
  const map = new Map(top100.map((g) => [String(g.id), g.name])); //  Map(2) { "174430" => "Gloomhaven", "316554" => "Dune: Imperium" }
  return ids.map((id) => ({ id, name: map.get(String(id)) || null })); //  [{ id: "316554", name: "Dune: Imperium" },  { id: "999999", name: null }   ]
}

module.exports = { computeJaccard, mapIdsToNames };

