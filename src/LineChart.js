import React, { Component, useState } from 'react';
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

export default function LineChart(props){
        Chart.defaults.animation = false
		return (
        <div style = {{position:"absolute", left:"10%", top:"2%", width: "30%", height: "20%"}}>
                <Line data={props.data} />
        </div>
		)
}