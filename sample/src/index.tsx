export default (...args: any) => {
    const value = "hello"
    console.log('arguments:', args)
    return <div key="2">
        <h2 ref="cdcd">reactv</h2>
        <>
            {value}
            cdnjcd
            <li onClick={() => { console.log('click') }}>1</li>
            <li>2</li>
        </>
    </div>
}