import React from 'react'
import boxImg from '../../Assets/Images/workflow-box.png';
import { loadAsset } from '../../Utils/common.utils';
import './toolbar.component.scss';

const Toolbar = () => {
    return (
        <div className='cw-toolbar'>
            <div className='toolbar-standard'>
                <div className='header'>Standard Shapes</div>
                <div className='tools'>
                    <div className='tool-item'>
                        <img src={ loadAsset(boxImg) } alt='box' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Toolbar
