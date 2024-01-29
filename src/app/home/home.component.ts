declare var require: any
import { Component } from '@angular/core';
import { SocketService } from '../socket.service';
import { Chart, registerables } from 'chart.js';
var iv = require("implied-volatility");
var greeks = require("greeks");
Chart.register(...registerables);

interface MarketData {
  [key: string]: {
    [strike: string]: {
      [optionType: string]: Object;
    };
  };
}

interface ExpirationDateMap {
  [underlying: string]: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  underlyings: string[] = ['ALLBANKS', 'MAINIDX', 'FINANCIALS', 'MIDCAPS'];
  expiryDates: string[] = [];
  showGreeks: boolean = false;
  showChart: boolean = false;
  selected_underlying = '';
  selected_expiryDate = '';
  timestamp: string = "";
  marketData: MarketData = {};
  displayData: any = {};
  expirationDateMap: ExpirationDateMap = {
    ALLBANKS: [],
    MAINIDX: [],
    FINANCIALS: [],
    MIDCAPS: []
  };
  chart: any = "";
  yIndex: string = "OI";

  spotPriceMap: any =
    {
      ALLBANKS: "",
      MAINIDX: "",
      FINANCIALS: "",
      MIDCAPS: ""
    }

  prevSpotPriceMap: any =
    {
      ALLBANKS: "",
      MAINIDX: "",
      FINANCIALS: "",
      MIDCAPS: ""
    }

  priceChange = "--";
  percentChange = "--";


  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.requestSnapshotData().subscribe((data: any) => {
      
      if (data['streamType'] == "SpotPriceUpdate") {
        console.log(JSON.stringify(data))
        this.spotPriceMap[data['underlying']] = data['ltp'];
        this.prevSpotPriceMap[data['underlying']] = data['prevClosePrice'];
        this.priceChange = (this.spotPriceMap[this.selected_underlying] - this.prevSpotPriceMap[this.selected_underlying]).toString()
        this.percentChange = ((this.spotPriceMap[this.selected_underlying] - this.prevSpotPriceMap[this.selected_underlying]) / this.prevSpotPriceMap[this.selected_underlying] * 100).toFixed(2) + "%";
        this.timestamp = data['timestamp'];
      }
      else {
        const key = data['key']['underlying'] + data['key']['expiryDate'];
        const strike = data['strike'];
        const optionType = data['optionType'];
        const marketData = this.marketData;
        if (Object.keys(marketData).length === 0) {
          console.log("First Entry...");
          this.selected_underlying = data['key']['underlying'];
          this.selected_expiryDate = data['key']['expiryDate'];
        }
        if (marketData[key]) {
          if (marketData[key][strike]) {
            marketData[key][strike][optionType] = data['data'];
          } else {
            marketData[key][strike] = {
              [optionType]: data['data']
            };
          }
        } else {
          try {
            this.expirationDateMap[data['key']['underlying']].push(
              data['key']['expiryDate']
            );
          }
          catch (error) {
            console.log(JSON.stringify(data))
          }
          this.expiryDates = this.expirationDateMap[this.selected_underlying];
          this.selected_expiryDate = this.expiryDates[0];
          marketData[key] = {
            [strike]: {
              [optionType]: data['data']
            }
          };
        }
      }
      this.displayData = this.postProcess(this.marketData[this.selected_underlying + this.selected_expiryDate]);
      this.updateChart();
    });

    this.chart = new Chart('chart1', {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: "Calls",
            data: [],
            borderColor: '#3f51b596',
            backgroundColor: "#3f51b596",
          },
          {
            label: "Puts",
            data: [],
            borderColor: '#ff78c571',
            backgroundColor: "#ff78c571"
          }
        ],
      },
      options:
      {
        plugins:
        {
          legend:
          {
            display: true,
          }
        },
        maintainAspectRatio: false,
        responsive: true,
      }
    });

  }


  public postProcess(data: any): any {
    let postProcessData: any = [];
    Object.keys(data).sort().forEach(key => {
      let row: any = {};
      let CE = data[key]["CE"] || '--';
      let PE = data[key]["PE"] || '--';

      // Call Calculations
       row['OI'] = CE['openInterest'] || '--',
        row['CHNG IN OI'] = CE['openInterest'] - CE['prevOpenInterest'] || '--',
        row['VOLUME'] = CE['volume'] || '--',
        row['LTP'] = CE['ltp'] || '--',
        row['CHNG'] = CE['ltp'] - CE['prevClosePrice'] || '--',
        row['BID QTY'] = CE['bidQuantity'] || '--',
        row['BID'] = CE['bidPrice'] || '--',
        row['ASK'] = CE['askPrice'] || '--',
        row['ASK QTY'] = CE['askQuantity'] || '--';

      if (CE['ltp'] && CE['ltp'] > 0) {
        var t = calculateTimeToMaturity(CE['expiryDate']);
        if (t <= 0 || this.spotPriceMap[this.selected_underlying].length==0) {
          var volatility = 0.00;
        }
        else {
          var volatility: number = iv.getImpliedVolatility(
            CE['ltp'],
            this.spotPriceMap[this.selected_underlying],
            key,
            t,
            0.05,
            "call"
          );

        }

        row['IV'] = (volatility * 100).toFixed(2) + "%";
        row['Delta'] = greeks.getDelta(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "call").toFixed(3);
        row['Gamma'] = greeks.getGamma(this.spotPriceMap[this.selected_underlying], parseFloat(key), t, volatility, .05).toFixed(3);
        var theta= greeks.getTheta(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "call");
        if(theta>0)
        {
          row['Theta'] = "--";
        }
        else
        {
          row['Theta'] = theta.toFixed(3);
        }
        row['Theta'] = greeks.getTheta(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "call").toFixed(3);
        row['Vega'] = greeks.getVega(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05).toFixed(3);
        row['Rho'] = greeks.getRho(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "call").toFixed(3);
      }
      else {
        row['IV'] = "--";
        row['Delta'] = "--";
        row['Gamma'] = "--";
        row['Theta'] = "--";
        row['Vega'] = "--";
        row['Rho'] = "--";
      }

      row['STRIKE'] = key;


      // Put Calculations

      // Calculate Options Greeks for Put Option
      row['ASK QTYp'] = PE['askQuantity'] || '--';
      row['ASKp'] = PE['askPrice'] || '--';
      row['BIDp'] = PE['bidPrice'] || '--';
      row['BID QTYp'] = PE['bidQuantity'] || '--';
      row['CHNGp'] = PE['ltp'] - PE['prevClosePrice'] || '--';
      row['LTPp'] = PE['ltp'] || '--';
      row['VOLUMEp'] = PE['volume'] || '--';
      row['CHNG IN OIp'] = PE['openInterest'] - PE['prevOpenInterest'] || '--';
      row['OIp'] = PE['openInterest']
      if (PE['ltp'] && PE['ltp'] > 0) {
        var t = calculateTimeToMaturity(PE['expiryDate']);

        if (t <= 0) {
          var volatility = 0.00;
        }
        else {
          var volatility: number = iv.getImpliedVolatility(
            PE['ltp'],
            this.spotPriceMap[this.selected_underlying],
            key,
            t,
            0.05,
            "put"
          );
        }

        row['IVp'] = (volatility * 100).toFixed(2) + "%";
        row['Deltap'] = greeks.getDelta(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "put").toFixed(3);
        row['Gammap'] = greeks.getGamma(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "put").toFixed(3);
        var thetap= greeks.getTheta(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "put");
        if(thetap>0)
        {
          row['Thetap'] = "--";
        }
        else
        {
          row['Thetap'] = thetap.toFixed(3);
        }        
        row['Vegap'] = greeks.getVega(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05).toFixed(3);
        row['Rhop'] = greeks.getRho(this.spotPriceMap[this.selected_underlying], key, t, volatility, .05, "put").toFixed(3);
      }
      else {
        row['IVp'] = "--";
        row['Deltap'] = "--";
        row['Gammap'] = "--";
        row['Thetap'] = "--";
        row['Vegap'] = "--";
        row['Rhop'] = "--";
      }
      postProcessData.push(row);
    })



    return (postProcessData)
  }

  onUnderlyingChange() {
    this.expiryDates = this.expirationDateMap[this.selected_underlying];
    this.selected_expiryDate = this.expiryDates[0];
    this.displayData = this.postProcess(this.marketData[this.selected_underlying + this.selected_expiryDate])
    this.priceChange = (this.spotPriceMap[this.selected_underlying] - this.prevSpotPriceMap[this.selected_underlying]).toString()
    this.percentChange = ((this.spotPriceMap[this.selected_underlying] - this.prevSpotPriceMap[this.selected_underlying]) / this.prevSpotPriceMap[this.selected_underlying] * 100).toFixed(2) + "%";
    this.updateChart();
  }

  onExpiryDateChange() {

    this.displayData = this.postProcess(this.marketData[this.selected_underlying + this.selected_expiryDate]);
    this.updateChart();
  }

  onYChange() {
    this.updateChart();
  }

  updateChart() {
    this.chart.data.labels = this.displayData.map((obj: any) => obj.STRIKE);
    if (this.yIndex == "IV") {
      this.chart.data.datasets[0].data = this.displayData.map((obj: any) => parseFloat(obj["IV"].replace("%", "")));
      this.chart.data.datasets[1].data = this.displayData.map((obj: any) => parseFloat(obj["IVp"].replace("%", "")));
    }
    else {
      this.chart.data.datasets[0].data = this.displayData.map((obj: any) => obj[this.yIndex]);
      this.chart.data.datasets[1].data = this.displayData.map((obj: any) => obj[this.yIndex + 'p']);
    }
    this.chart.update();
  }
}

function calculateTimeToMaturity(expiryDateStr: string): number {
  const now = new Date();
  const expiryDate = new Date(expiryDateStr);
  const expiryTime = new Date(
    expiryDate.getFullYear(),
    expiryDate.getMonth(),
    expiryDate.getDate(),
    15, // Expiry time assumed to be 15:30 IST
    30,
    0
  );
  const millisecondsPerMinute = 60000;
  const minutesToExpiry = (expiryTime.getTime() - now.getTime()) / millisecondsPerMinute;

  return minutesToExpiry >= 0 ? minutesToExpiry / (24 * 60 * 365) : 0; // Return fraction of a year, or 0 if the contract has expired
}