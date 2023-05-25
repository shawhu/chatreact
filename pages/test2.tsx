import * as React from "react";
var _count = 0;
export default function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p>The count is: {count}</p>
      <button
        onClick={() => {
          _count++;
          setCount(count + 1);
          console.log(`_count:${_count} statecount: ${count}`);
        }}
      >
        Increment
      </button>
    </div>
  );
}
