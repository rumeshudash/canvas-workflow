import React, { useEffect, useState } from 'react';

import CanvasWorkflow from 'canvas-workflow';
import { CanvasData } from 'canvas-workflow/dist/Dtos/canvas.dtos';
import 'canvas-workflow/dist/index.css';

const App = () => {
    const [data, setData] = useState<CanvasData>({});

    useEffect(() => {
        setData({ ...testData, height: window.innerHeight });
        // eslint-disable-next-line
    }, []);

    const dataChangeHandle = (data: CanvasData) => {
        setData(data);
        console.log(data);
    };

    return (
        <div>
            <CanvasWorkflow
                mode='editor'
                data={data}
                onDataChange={dataChangeHandle}
            />
        </div>
    );
};

export default App;

const testData = {
    height: 821,
    components: [
        {
            key: '1jjruil',
            type: 'box',
            title: 'Workflow',
            description: 'Your workflow description here.',
            x: 140,
            y: 230,
            w: 150,
            h: 100,
            lineWidth: 1,
            fillColor: '#ffffff',
            options: [
                {
                    key: '19p8484',
                    name: 'Always'
                }
            ]
        },
        {
            key: '1ixoywz',
            type: 'box',
            title: 'Workflow',
            description: 'Your workflow description here.',
            x: 440,
            y: 90,
            w: 150,
            h: 100,
            lineWidth: 1,
            fillColor: '#ffffff',
            options: [
                {
                    key: 'vdz7bb',
                    name: 'Always'
                }
            ]
        }
    ],
    lines: [
        {
            componentKey: '1jjruil',
            optionKey: '19p8484',
            targetKey: '1ixoywz',
            joints: []
        }
    ]
};
