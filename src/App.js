import './App.css';
import SunBurstM from './SunBurstM.js';
import {XYPlot,XAxis,YAxis,HorizontalGridLines,VerticalGridLines,ArcSeries,VerticalBarSeriesCanvas,HorizontalBarSeriesCanvas} from 'react-vis';
import {EXTENDED_DISCRETE_COLOR_RANGE as COLORS} from 'react-vis/dist/theme';
import DiscreteColorLegend from 'react-vis/dist/legends/discrete-color-legend';
import {orders1,orders2} from './orders.js';

let o1FullSum=0,o2FullSum=0,o1closed=0,o1cancelled=0,o1unconfirmed=0,o1counter=0,o1trouble=0,o2counter=0,o1lostProfit=0
function getDataset1o1(){
  let res=[];
  let maxD=0;
  orders1.forEach(function(it){
    let b=true;
    let dt=it.createdTime.split(" ");
    o1FullSum+=it.sum;
    o1closed+=it.statusCode==="CLOSED"?1:0;
    o1cancelled+=it.statusCode==="CANCELLED"?1:0;
    o1unconfirmed+=it.statusCode==="UNCONFIRMED"?1:0;
    o1trouble+=(it.statusCode==="CANCELLED"||it.statusCode==="UNCONFIRMED")?1:0;
    res.forEach(function(day){
      if(day.createdDay===dt[0]){
        b=false;
        day.sum+=it.sum;
        day.closed+=(it.statusCode==='CLOSED'?1:0);
        day.cancelled+=(it.statusCode==='CANCELLED'?1:0);
        day.unconfirmed+=(it.statusCode==='UNCONFIRMED'?1:0);
        day.counter+=1;
        if((it.statusCode==="CANCELLED"||it.statusCode==="UNCONFIRMED")&&it.items.length>0){
          it.items.forEach(function(itit){
            day.lostProfit+=itit.sum
          });
        }
      }
    });
    if(b){
      let cd=new Date(dt[0]);
      cd.setHours(7,0,0,0);
      maxD=maxD>cd?maxD:cd;
      let lostProfit=0; 
      if((it.statusCode==="CANCELLED"||it.statusCode==="UNCONFIRMED")&&it.items.length>0){
        it.items.forEach(function(itit){
          lostProfit+=itit.sum
        });
      }
      res.push({'createdDay':dt[0],'datef':cd,'date':cd.getDate(),'sum':it.sum,'counter':1,
                'closed':it.statusCode==='CLOSED'?1:0,'cancelled':it.statusCode==='CANCELLED'?1:0,
                'unconfirmed':it.statusCode==='UNCONFIRMED'?1:0,'lostProfit':lostProfit});
    }
  });
  let t=new Date(maxD.getFullYear(),maxD.getMonth(),maxD.getDate()+3);
  //Add additional date with sum is null for X Axis title fit the chart (without overlay with data)
  res.push({'createdDay':maxD.getFullYear()+'-'+maxD.getMonth()+'-'+maxD.getDate()+3,
            'datef':t,'date':t.getDate(),'sum':0,'counter':0,
            'closed':0,'cancelled':0,'unconfirmed':0,'lostProfit':0});
  res.sort(function(a,b){
    let res;
    if(a.createdDay>b.createdDay){res=1}
    if(a.createdDay===b.createdDay){res=0}
    if(a.createdDay<b.createdDay){res=-1}
    return res
  });
  o1counter=o1cancelled+o1closed+o1unconfirmed;
  o1lostProfit=res.reduce(function(prev,item,ind,arr){
    return prev+item.lostProfit
  },0);
  return res
}

function getDataset2o1(){
  let res=[];
  orders1.forEach(function(it){
    let cName=it.customerName?it.customerName:it.guests[0].name?it.guests[0].name:'Другие';
    let cCust=res.find(i => i.name===cName);
    if(!cCust){
      cCust={name:cName,sum:0,counter:0,closed:0,lost:0};
      res.push(cCust);
    }
    cCust.counter+=1;
    cCust.sum+=it.sum;
    if(it.statusCode==='CLOSED'){
      cCust.closed+=1;
    }else{
      cCust.lost+=1;
    }
  });
  res.sort(function(a,b){
    let res;
    if(a.sum>b.sum){res=1}
    if(a.sum===b.sum){res=0}
    if(a.sum<b.sum){res=-1}
    return res
  });
  return res
}

function getDataset3o1(){
  let res=[];
  orders1.forEach(function(it){
    it.items.forEach(function(it2){
      let cProd=res.find(i => i.name===it2.name && (!it2.modifiers.length||(it2.modifiers.length && i.mod===it2.modifiers[0].name)));
      if(!cProd){
        cProd={name:it2.name,mod:it2.modifiers.length?it2.modifiers[0].name:'',sum:0,counter:0,closed:0,lost:0};
        res.push(cProd);
      }
      cProd.counter+=1;
      cProd.sum+=it2.sum;
    });
  });
  res.sort(function(a,b){
    let res;
    if(a.name>b.name){res=1}
    if(a.name===b.name){res=0}
    if(a.name<b.name){res=-1}
    return res
  });
  let res2=[];
  res.forEach(function(it){
    if(!res2.find(i => i.name===it.name)){
      res2.push({name:it.name,hex:COLORS[Math.trunc(Math.random()*21)],children:[]});
    }
  });
  res.forEach(function(it){
    const ch=res2.find(i => i.name===it.name);
    const ch2n=it.mod?it.mod:'оригинал';
    let ch2=ch.children.find(i => i.name===ch2n);
    if(ch2){
      ch2.value+=it.sum;
      ch2.counter+=1;
    }else{
      ch2={name:it.mod,hex:ch.hex,value:it.sum,counter:1};
      ch.children.push(ch2);
    }
  });
  console.log(res2);
  return res2
}

function getDataset1o2(){
  let res=[];
  orders2.forEach(function(it){
    let b=true;
    let dt=new Date(it.created*1000);
    let m=(dt.getMonth()+1).toString().length===1?'0'+(dt.getMonth()+1):(dt.getMonth()+1).toString()
    let tdt=dt.getFullYear()+'-'+m+'-'+dt.getDate();
    o2FullSum+=it.sum/100;
    o2counter+=1;
    res.forEach(function(day){
      if(day.createdDay===tdt){
        b=false;
        day.sum+=it.sum/100;
        day.counter+=1;
      }
    });
    if(b){
      let cd=new Date(tdt);
      res.push({'createdDay':tdt,'datef':cd,'date':cd.getDate(),'sum':it.sum/100,'counter':1});
    }
  });
  res.sort(function(a,b){
    let res;
    if(a.createdDay>b.createdDay){res=1}
    if(a.createdDay===b.createdDay){res=0}
    if(a.createdDay<b.createdDay){res=-1}
    return res
  });
  return res
}

function arrEquiArea(baseArr,moddArr){
  baseArr.forEach(function(it){
    let curV=it.createdDay;
    let b =true
    for(let itInd in moddArr){
      let it2=moddArr[itInd];
      if(curV===it2.createdDay){
      console.log(it2.datef);
      console.log(it.datef);
      b=false;
        break
      }
    };
    if(b){
      moddArr.push({'createdDay':it.createdDay,'datef':it.datef,'date':it.date,'sum':0,'counter':0});
    }
  });
  moddArr.sort(function(a,b){
    let res
    if(a.createdDay>b.createdDay){res=1}
    if(a.createdDay===b.createdDay){res=0}
    if(a.createdDay<b.createdDay){res=-1}
    return res
  });
  return moddArr
}

function App() {
  const BarSeries = VerticalBarSeriesCanvas;
  const HBarSeries = HorizontalBarSeriesCanvas;
  

  let ds1o1=getDataset1o1();
  // datasets for 1.1-3 
  let ds1p1=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'counter':i.counter}));
  console.log(ds1p1);
  let ds1p2=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'counter':i.closed}));
  console.log(ds1p2);
  let ds1p3=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'counter':i.cancelled}));
  console.log(ds1p3);
  let ds1p4=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'counter':i.unconfirmed}));
  console.log(ds1p4);
  //problem order dataset counter 
  let ds1p5=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'counter':i.unconfirmed+i.cancelled}));
  console.log(ds1p5);
  // datasets for 1.4 
  let ds1p6=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'sum':i.sum}));
  console.log(ds1p6);
  let ds1p7=ds1o1.map(i => ({'createdDay':i.createdDay,'datef':i.datef,'date':i.date,'sum':i.lostProfit}));
  console.log(ds1p7);
  let ds1o2=getDataset1o2();
  ds1o2=arrEquiArea(ds1o1,ds1o2);
  
  const data4Arc1d1 = [
    {angle0: 0, angle: 2 * Math.PI, radius: 2, radius0: 0,color:COLORS[10]},
    {angle0: 0, angle: 2 * Math.PI *(o2counter/o1counter), radius: 3, radius0: 0,color:'#79C7E3',},
  ]
  const data4Arc1d2 = [
    {angle0: 0, angle: 2 * Math.PI, radius: 3, radius0: 0,color:COLORS[10]},
    {angle0: 0, angle: 2 * Math.PI *(o1cancelled/o1counter), radius: 2.5, radius0: 0,color:'#1A3177'},
    {angle0: 2 * Math.PI *(o1cancelled/o1counter), angle: 2 * Math.PI *((o1cancelled+o1unconfirmed)/o1counter), radius: 2.5, radius0: 0,color:'#FF9833'},
    {angle0: 2 * Math.PI *((o1cancelled+o1unconfirmed)/o1counter), angle: 2 * Math.PI *((o1cancelled+o1unconfirmed+o1closed)/o1counter), radius: 2.5, radius0: 0,color:'#79C7E3'},
  ]
  const data4Arc1d3 = [
    {angle0: 0, angle: 2 * Math.PI, radius: 3, radius0: 0,color:COLORS[10]},
    {angle0: 0, angle: 2 * Math.PI *(o1trouble/o1counter), radius: 2.5, radius0: 0,color:'#1A3177'},
    {angle0: 2 * Math.PI *(o1trouble/o1counter), angle: 2 * Math.PI *((o1closed+o1trouble)/o1counter), radius: 2.5, radius0: 0,color:'#79C7E3'},
  ]
  const data4Arc1d4 = [
    {angle0: 0, angle: 2 * Math.PI, radius: 2, radius0: 0,color:COLORS[10]},
    {angle0: 0, angle: 2 * Math.PI *(o1lostProfit/o1FullSum), radius: 3, radius0: 0,color:'#79C7E3'},
  ]

  let ds2o1=getDataset2o1();
  console.log(ds2o1);
  let ds2o1m1=ds2o1.filter(i => i.name!=='Гость').map(function(i){i.lost*=-1;return i});
  console.log(ds2o1m1);
  let ds3o1=getDataset3o1();
  console.log(ds3o1);
  let ds3o1m1={'children': ds3o1};
  console.log(ds3o1m1);

  return (
    <div className="App">
      <header className="App-header">

      </header>
      <a name='top'/>
      <h1>Визуальный анализ заказов</h1>
        <ul className='content-list'>
          <li><a href='#p1'>1. Сравнения заказов и их ежедневнй анализ</a></li>
          <li className='content-list-subitem'><a href='#p1-1'>1.1. Сравнение количества заказов в orders1 и orders2</a></li>
          <li className='content-list-subitem'><a href='#p1-2'>1.2. Количество заказов по статусам</a></li>
          <li className='content-list-subitem'><a href='#p1-3'>1.3. Количество проблемных заказов</a></li>
          <li className='content-list-subitem'><a href='#p1-4'>1.4. Количество вырученных и потерянных средств</a></li>
          <li><a href='#p2'>2. Анализ индивидуальной покупательской активности</a></li>
          <li className='content-list-subitem'><a href='#p2-1'>2.1. Количество совершенных покупателем покупок</a></li>
          <li className='content-list-subitem'><a href='#p2-2'>2.2. Количество оставленных покупателем денег</a></li>
          <li className='content-list-subitem'><a href='#p2-3'>2.3. Количество сорванных сделок с покупателем</a></li>
          <li><a href='#p3'>3. Анализ продуктовой популярности</a></li>
        </ul>
      <a name='p1'></a>
      <h2>1. Сравнения заказов и их ежедневнй анализ</h2>
      <a name='p1-1'></a>
      <h3>1.1. Сравнение количества заказов в orders1 и orders2</h3>
      <XYPlot
        className='chart'
        width={1000}
        height={600}
        stackBy="x"
        getX={d=>d.datef/1000}
        getY={d=>d.counter}>
        <HorizontalGridLines />
        <BarSeries data={ds1o1}/>
        <BarSeries data={ds1o2}/>
        <XAxis  tickFormat={(v,i) => new Date(v*1000).getDate()}
                tickLabelAngle={-90} title={'Дата: 2020 июнь-июль'}/>
        <YAxis title={'Число заказов'} />
        <DiscreteColorLegend height={100} width={200} items={['orders1: '+o1counter/2,'orders2: '+o2counter/2]} />
      </XYPlot>
      <XYPlot
        className='chart'
        xDomain={[-50, 50]}
        yDomain={[-50, 50]}
        width={300}
        height={300}>
        <ArcSeries
          center={{x: -2, y: 2}}
          data={data4Arc1d1}
          getLabel={d=>d.label}
          colorType={'literal'}
          />
      </XYPlot>

      <a name='p1-2'></a>
      <h3>1.2. Количество заказов по статусам <a className='top-btn' href='#top'>Вверх к оглавлению</a></h3>
      <XYPlot
        className='chart'
        width={1000}
        height={600}
        stackBy="x"
        getX={d=>d.datef/1000}
        getY={d=>d.counter}>
        <HorizontalGridLines />
        <BarSeries data={ds1p1}/>
        <BarSeries data={ds1p2}/>
        <BarSeries data={ds1p3}/>
        <BarSeries data={ds1p4}/>
        <XAxis  tickFormat={(v,i) => new Date(v*1000).getDate()}
                tickLabelAngle={-90} title={'Дата: 2020 июнь-июль'}
                style={{title:{top:'40px',}}}/>
        <YAxis title={'Число заказов'} />
        <DiscreteColorLegend 
          className='chart-legend'
          height={200} width={250} 
          items={['Всего заказов: '+o1counter/2,'Выполнено: '+o1closed/2,'Отменено: '+o1cancelled/2,'Неподтверждено: '+o1unconfirmed/2]} />
      </XYPlot>
      <XYPlot
        className='chart'
        xDomain={[-50, 50]}
        yDomain={[-50, 50]}
        width={300}
        height={300}>
        <ArcSeries
          center={{x: -2, y: 2}}
          data={data4Arc1d2}
          colorType={'literal'}
          />
      </XYPlot>

      <a name='p1-3'></a>
      <h3>1.3. Количество проблемных заказов <a className='top-btn' href='#top'>Вверх к оглавлению</a></h3>
      <XYPlot
        className='chart'
        width={1000}
        height={600}
        stackBy="x"
        getX={d=>d.datef/1000}
        getY={d=>d.counter}>
        <HorizontalGridLines />
        <BarSeries data={ds1p1}/>
        <BarSeries data={ds1p5}/>
        <XAxis  tickFormat={(v,i) => new Date(v*1000).getDate()}
                tickLabelAngle={-90} title={'Дата: 2020 июнь-июль'}/>
        <YAxis title={'Число заказов'} />
        <DiscreteColorLegend 
          className='chart-legend'
          height={200} width={250} 
          items={['Всего заказов: '+o1counter/2,'Выполненые: '+o1closed/2,'Проблемные: '+o1trouble/2]} />
      </XYPlot>
      <XYPlot
        className='chart'
        xDomain={[-50, 50]}
        yDomain={[-50, 50]}
        width={300}
        height={300}>
        <ArcSeries
          //animation
          //radiusType={'literal'}
          center={{x: -2, y: 2}}
          data={data4Arc1d3}
          colorType={'literal'}
          />
      </XYPlot>

      <a name='p1-4'></a>
      <h3>1.4. Количество вырученных и потерянных средств <a className='top-btn' href='#top'>Вверх к оглавлению</a></h3>
      <XYPlot
        className='chart'
        width={1000}
        height={600}
        stackBy="x"
        getX={d=>d.datef/1000}
        getY={d=>d.sum}>
        <HorizontalGridLines />
        <BarSeries data={ds1p6}/>
        <BarSeries data={ds1p7}/>
        <XAxis  tickFormat={(v,i) => new Date(v*1000).getDate()}
                tickLabelAngle={-90} title={'Дата: 2020 июнь-июль'}/>
        <YAxis tickFormat={v => v/1000} title={'Сумма в тыс. руб'} />
        <DiscreteColorLegend height={100} width={250} items={['Вырученные средства: '+o1FullSum/2,'Потерянные средства: '+o1lostProfit]} />
      </XYPlot>
      <XYPlot
        className='chart'
        xDomain={[-50, 50]}
        yDomain={[-50, 50]}
        width={300}
        height={300}>
        <ArcSeries
          center={{x: -2, y: 2}}
          data={data4Arc1d4}
          colorType={'literal'}
          />
      </XYPlot>

      <a name='p2'></a>
      <h2>2. Анализ индивидуальной покупательской активности </h2>
      <a name='p2-1'></a>
      <a name='p2-3'></a>
      <h3>2.1. Количество совершенных покупателем покупок <br/> и 2.3. Количество сорванных сделок с покупателем <br/><a className='top-btn' href='#top'>Вверх к оглавлению</a></h3>
      <p>Число сорванных сделок указано отрицательными значениями. </p>
      <XYPlot
        className='chart'
        width={1000}
        height={ds2o1.length*20}
        margin={{left: 10, right: 10, top: 40, bottom: 10}}
        yType={'ordinal'}
        xPadding={30}
        xType={'linear'}
        getY={d=>d.name}
        getX0={d=>d.lost}
        getX={d=>d.closed}>
        <VerticalGridLines />
        <HBarSeries
          data={ds2o1m1}/>
        <XAxis orientation={'top'} title={'Совершенные/сорванные сделки'}/>
        <YAxis width={200} />
      </XYPlot>

      <a name='p2-2'></a>
      <h3>2.2. Количество оставленных покупателем денег <a className='top-btn' href='#top'>Вверх к оглавлению</a></h3>
      <XYPlot
        className='chart'
        width={1000}
        height={ds2o1.length*20}
        margin={{left: 10, right: 10, top: 40, bottom: 10}}
        yType={'ordinal'}
        xPadding={30}
        xType={'linear'}
        getY={d=>d.name}
        getX={d=>d.sum}>
        <VerticalGridLines />
        <HBarSeries data={ds2o1m1}/>
        <XAxis orientation={'top'} title={'Потраченная сумма'}/>
        <YAxis width={200} />
      </XYPlot>

      <a name='p3'></a>
      <h2>3. Анализ продуктовой популярности <a className='top-btn' href='#top'>Вверх к оглавлению</a></h2>
      <p>Величина сегмента продукта пропорциональна принесенной им прибыли.</p>
      <SunBurstM
        className='chart'
        data={ds3o1m1}/>
    </div>
  );
}

export default App;
