import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Line} from 'react-chartjs-2'

const Chart_Test=(data) =>{
  const lineRef = useRef();
  useEffect(()=>{
    lineRef.data = {
      labels: [...Array(4).keys()],
      datasets: [{
        labels: '#votes',
        data: data,
      }]
    }
    console.log(data);
  }, [data])
  
  return(
      <Line ref={lineRef}
      data={{
        labels: [...Array(4).keys()],
        datasets: [{
          labels: '#votes',
          data: data,
        }]
      }}
      width={100}
      height= {300}
      options={{maintainAspectRatio:false}}
      redraw= {true}
      />
  )
}

export default Chart_Test;