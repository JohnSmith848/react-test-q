import React from 'react';

import Sunburst from 'react-vis/dist/sunburst';
//import {EXTENDED_DISCRETE_COLOR_RANGE} from 'react-vis/dist/theme';
import {LabelSeries} from 'react-vis';


export default function SunBurstM (props) {
    return (
      <div className="basic-sunburst-example-wrapper">
        <Sunburst
          animation
          className="basic-sunburst-example"
          hideRootNode
          onValueMouseOver={node => {
            let s1='',s2='',s3='';
            if(node.depth===1){
            s2='Выручил: '+node.children.reduce(function(p,i){
                return p+i.value
            },0);
            s1 =node.name;
            s3=' ';
            }else{
            s1=node.parent.data.name;
            s2=' (мод.: '+node.name+')';
            s3='Выручил: '+node.value;
            }
            document.querySelector('.sunburst-label.r1>text').innerHTML=s1;
            document.querySelector('.sunburst-label.r2>text').innerHTML=s2;
            document.querySelector('.sunburst-label.r3>text').innerHTML=s3;
          }}
          onValueMouseOut={() =>{
            document.querySelector('.sunburst-label.r1>text').innerHTML='Наведите мышку на сегмент';
            document.querySelector('.sunburst-label.r2>text').innerHTML=' ';
            document.querySelector('.sunburst-label.r3>text').innerHTML=' ';
          }}
          style={{
            stroke: '#ddd',
            strokeOpacity: 0.3,
            strokeWidth: '0.5'
          }}
          colorType="literal"
          getSize={d => d.value}
          getColor={d => d.hex}
          data={props.data}
          height={600}
          width={700}
        >
            <LabelSeries
                className='sunburst-label r1'
              data={[{x: 0, y: 0, label:'Наведите мышку на сегмент'}]}
            />
            <LabelSeries
                className='sunburst-label r2'
              data={[{x: 0, y: -20, label:' '}]}
            />
            <LabelSeries
                className='sunburst-label r3'
              data={[{x: 0, y: -40, label:' '}]}
            />
        </Sunburst>
      </div>
    );
}
