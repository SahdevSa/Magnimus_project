import { Line } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import LineChart from "./LineChart";
import { useEffect, useState } from "react";



export default function Chart_Test() {
    const [data, setData] = useState({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "First dataset",
            data: [33, 53, 85, 41, 44, 65],
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
          },
          {
            label: "Second dataset",
            data: [33, 25, 35, 51, 54, 76],
            fill: false,
            borderColor: "#742774"
          }
        ],
        options: {
            animation: false
        }
      });

      useEffect(() => {
        const interval = setInterval(() => {
          setData({
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "First dataset",
                data: Array.from({length: 6}, () => Math.floor(Math.random() * 40)),
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)"
              },
              {
                label: "Second dataset",
                data: Array.from({length: 6}, () => Math.floor(Math.random() * 40)),
                fill: false,
                borderColor: "#742774"
              }
            ],
            options: {
                animation: false
            }
          });
        }, 10);
      
        return () => clearInterval(interval);
      }, []);

    return (
        <div>
        <LineChart data= {data}/>
        </div>
    );   
}