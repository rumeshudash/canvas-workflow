import React from 'react'
import { ReactComponent as BoxSvg } from '../../Assets/Images/workflowBox.svg'  ;
import './toolbar.component.scss';

const Toolbar = () => {

    const handleDragStart = ( event: any ) => {
        event.dataTransfer.setData("id", event.target.id );
    }

    return (
        <div className='cw-toolbar'>
            <div className='toolbar-standard'>
                <div className='title'>Standard Shapes</div>
                <div className='tools'>
                    <div id='box' className='tool-item' draggable="true" onDragStart={ handleDragStart }>
                        <BoxSvg/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Toolbar
