import React, { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import './collapse.component.scss';

interface CollapseProps {
    title: string;
    children: any;
}

const Collapse = ({ title, children }: CollapseProps) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className='collapse'>
            <div className='title' onClick={ () => setCollapsed( ! collapsed ) }>{title} <span className={`arrow ${ ! collapsed ? 'down' : '' }`}/></div>
            <AnimateHeight
                duration={ 500 }
                height={ collapsed ? 0 : 'auto' }
            >
                <div className='controls'>
                    {children}
                </div>
            </AnimateHeight>
        </div>
    )
}

export default Collapse
