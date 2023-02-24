import { useState } from "@reactv/core"
export default (...args: any) => {
    const value = "hello"
    console.log('arguments:', args)
    const [count, setCount] = useState(0);
    return <div key="2">
        <h2 ref="cdcd">reactv</h2>
        <>
            {value}

            <li onClick={() => { console.log('click') }}>1</li>
            <li>2</li>
        </>
        <p>{count}</p>
        <button id="btn" onClick={() => setCount((v) => v + 1)}>Click Me</button>
    </div>
}
