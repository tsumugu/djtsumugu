import { useDeferredValue, useState } from "react";
import Result from "./component/result";

function Search() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Result query={deferredQuery} />
    </>
  );
}
export default Search;
