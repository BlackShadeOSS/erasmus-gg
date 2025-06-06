'use client'; 

import React from 'react';

type Props = {
    width: number;
    height: number;
};

function Vocaba({ width, height }: Props) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
        />
    );
}
export default Vocaba;