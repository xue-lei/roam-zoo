import { useState } from "react"

export const Tree = () => {


  const [num, setNum] = useState(0);

  return <>
    <div onClick={() => setNum(num + 1)}>
      {num}
    </div>
  </>
}

