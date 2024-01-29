
# OPTION CHAIN TOOL

The Options Chain Tool is a real-time options market analysis web application with a user-friendly interface, live data updates, and efficient performance. It supports custom filters, socket programming for live data, and implied volatility calculations.

## About Files
Options Trading(main folder) contains 3 folders
- src - Frontend
- TestServer - Backend
- DemoFiles - Contains DemoVideo and Ppt


## Link to video and Ppt

https://drive.google.com/drive/folders/1eDbRGfkAPKV9U2h2GxcCXlPFQ2EEpVtH?usp=sharing

## Table of Contents

- [Problem Statement](#Problem-Statement)
- [Technologies Used](#Technologies-Used)
- [Installation](#Installation)
- [Features](#Features)
- [Screenshots](#Screenshots)
- [Authors](#Authors)
## Problem Statement

The candidates will be provided with a market data stream over TCP/IP which will contain the market data structure as given below. Your goal is to process the market data and calculate Implied volatility (IV), etc. and display as an options chain screen (e.g. https://www.nseindia.com/option-chain ) as a webpage. The following points should be catered.

- Highlight the "in the money" options and "out of money" options differently as shown in above example.

- There must be a selection of underlying and different expiries.

- The options chain should work in real-time. As the market data changes, the fields should be recalculated and refreshed on screen without having to reload on the browser.

For Implied Volatility (IV) calculation, you can assume the following:

- Use Black Scholes Formula for calculating IV from options price.
- Risk free interest rate as 5%
- To calculate Time To maturity (TTM) accurately, you can assume the expiry time to be at 15:30 IST on the expiry day. As soon as the contract expires, TTM will be negative implying IV as 0.

An option being a derivative of an underlying, you will need an underlying price which will also be published in the same market data stream.
## Technologies Used

**Frontend:** Angular

**Backendr:**  Nodejs

**Server:** Java

**Proxy Server:**  Nodejs


## Installation


To install and set up the Options Chain Tool, follow these steps:

- Clone the project Repository
- Install Java on your device to run the jar file(the server)
- To run the jar file use command `java -Ddebug=true -Dspeed=2.0 -classpath ./feed-play-1.0.jar hackathon.player.Main dataset.csv 9011`
- Install nodejs `https://nodejs.org/en/download`
- To run the nodejs server run the command `node connect2.js`
- Install Angular using `npm install -g @angular/cli`
- Run command ` ng serve -o` to run the angular application.




    
## Features

- Real Time Sharing
- In the Money and Out of the Money highlighting
- Expiration Date Choice
- Customisable Options to choose the required Bank
- User friendly interface
- Maximum accuracy IV is calculated and provided
- Responsive web design
- Homepage Ui


## Demo


https://github.com/Yashcoder2802/OptionsChainTool/assets/84177162/de2d0899-a2f3-4a44-9b79-274898747986



## Screenshots

![App Screenshot](https://cdn.discordapp.com/attachments/1124570781070917735/1125835088073076898/image.png)


![App Screenshot](https://cdn.discordapp.com/attachments/1124570781070917735/1125872416351064144/image.png)



