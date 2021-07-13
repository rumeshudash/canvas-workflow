import React from 'react'
import Collapse from '../Collapse/collapse.component';
import { ReactComponent as BoxSvg } from '../../Assets/Images/workflowBox.svg'  ;
import { DrawArrowLineIcon } from '../../Utils/image.utils';
import './toolbar.component.scss';

const Toolbar = () => {

    const handleDragStart = ( event: any ) => {
        event.dataTransfer.setData("id", event.target.id );
    }

    return (
        <div className='cw-toolbar'>
            <Collapse title='Standard Shapes'>
                <div className='tools'>
                    <div id='box' className='tool-item' draggable="true" onDragStart={ handleDragStart }>
                        <BoxSvg/>
                    </div>
                </div>
            </Collapse>
            <div className='image-loader' style={{display: 'none'}}>
                <img id='arrowLineIcon' src={DrawArrowLineIcon} alt='arrow icon'/>
            </div>
        </div>
    )
}

export default Toolbar
