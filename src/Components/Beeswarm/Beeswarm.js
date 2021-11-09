import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import "./Beeswarm.css";
import _ from 'lodash';

const Beeswarm = ({ data, selectedSector, selectedCeoFounder, selectedCeoWoman, selectedState, selectedCompany, setSelectedCompnay }) => {

  const svgRef = useRef();

  const [currentData, setCurrentData] = useState(data);
  

  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 40, bottom: 30, left: 100 }

  const circleBaseColour = '#2C384E'
  const circleStrokeColour = '#fff'
  const circleWomanColour = '#ee6c4d'


  useEffect(() => {
    setSelectedCompnay(null)
    const unselectedString = 'any'

    // isolate the condition under which we display all the data 
    const allDataSelectedCondition = (selectedSector === unselectedString) 
                                    && (selectedCeoFounder === unselectedString) 
                                    && (selectedCeoWoman === unselectedString)
                                    && (selectedState === unselectedString)

    // set filtering conditions for each of the selectors s.t. if the selector is the passed selected value 
    // or the selector is currently irrelevant, these get passed down do the condition (intersection) for data filtering                               
    const sectorsCondition = d => (d['sector'] === selectedSector) || (selectedSector === unselectedString)
    const ceoFounderCondition = d => (d['ceo_founder'] === selectedCeoFounder) || (selectedCeoFounder === unselectedString)
    const ceoWomanCondition = d => (d['ceo_woman'] === selectedCeoWoman) || (selectedCeoWoman === unselectedString)
    const stateCondition = d => (d['state'] === selectedState) || (selectedState === unselectedString)

    if (data && selectedSector && selectedCeoFounder) {
      data.forEach(d => {
        if (allDataSelectedCondition) {
          d['selected'] = 'yes'
        }
        else {
          // the 'and' condition means intersection for the true vals of all the selectors
          if (sectorsCondition(d) && ceoFounderCondition(d) && ceoWomanCondition(d) && stateCondition(d)) {
            d['selected'] = 'yes'
          } else {
            d['selected'] = 'no'
          }
        }
      })
      setCurrentData(data.slice(0, 1000))
    }
  }, [data, selectedSector, selectedCeoFounder, selectedCeoWoman, selectedState])


  //////////////////////////////////////////////
  ///////////////// D3 code ////////////////////
  //////////////////////////////////////////////
  useEffect(() => {
    if (currentData) {

      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)

      /// Scales ///
      // x scale for positioning horizontally based on revenue
      const xScale = d3.scaleSqrt()
        .domain(d3.extent(currentData, d => d.revenue))
        .range([margin.left, width - margin.right])

      // size scale for the radius of circles based on num employees 
      const rScale = d3.scaleSqrt()
        .domain(d3.extent(currentData, d => d['num. of employees']))
        .range([2, 30])


      /// Axes ///
      // x axis - show the main revenue values 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale)
          .tickSizeOuter(0)
          .ticks(8)
          .tickFormat(i => `$${d3.format(",.2s")(i)}`) 
        )
        .call(g => g.selectAll(".tick line")
          .attr("y2", -height+100)
          .attr("opacity", 0.5)
          .attr("stroke-width", 0.5)
          .attr('stroke-dasharray', '3 1')
          .attr("color", 'grey')
        )
        .call(g => g.selectAll("text")
          .attr("font-size", '12px')
          .attr("color", circleBaseColour)
          .attr("opacity", 0.8)
          .attr("font-weight", "bold")
        )
        .call(g => g.select(".domain")
          .attr("stroke-width", 4)
          .attr("stroke", circleBaseColour)
        )

      /// Call the axes ///
      svg.selectAll('.x-axis').data([null]).join("g")
        .classed("x-axis", true)
        .call(xAxis)

    
      /// Force definition ///
      // define force where x is based on the horizonral scale, y pushes the circles to the middle
      const force = d3.forceSimulation(currentData)
        .force('forceX', d3.forceX(d => xScale(d['revenue'])).strength(2))
        .force('forceY', d3.forceY(height/2).strength(0.1))
        .force('collide', d3.forceCollide(d => rScale(d['num. of employees']) + 0.5).strength(1.5))
    
      // then run the force for a large number of iterations even before appending the shapes 
      // this way the layout is calculated first and we don't see the giggling in place on load
      const NUM_ITERATIONS = 400;
      for (let i = 0; i < NUM_ITERATIONS; ++i) {
        force.tick();
      };
      force.stop();

      ///////////////////////////////////////////////////
      //////////////// Beeswarm Plot ////////////////////
      ///////////////////////////////////////////////////

      // 1. group for the whole plot
      const beeswarmG = svg.selectAll(".beeswarm-g")
        .data([null])
        .join("g")
        .classed("beeswarm-g", true)

      // 2. circles for each company
      const beeswarmCircles = beeswarmG.selectAll(".beeswarm-circle")
        .data(currentData)
        .join("circle")
        .classed("beeswarm-circle", true)
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", d => rScale(d['num. of employees']))
          .attr("fill", d => d['ceo_woman'] === 'yes' ? circleStrokeColour : circleBaseColour)
          .attr("opacity", d => d['selected'] === 'yes' ? 1 : 0.1)
          //.attr("opacity", 1)
          .attr("stroke", d => d['ceo_woman'] === 'yes' ? circleWomanColour : 'none')
          .attr("stroke-dasharray", d => d['ceo_woman'] === 'yes' 
            ? `2 ${Math.round(rScale(d['num. of employees'])*0.25)}` 
            : 'none'
          )
          .attr("stroke-width", d => d['ceo_woman'] === 'yes' ?  rScale(d['num. of employees'])*0.2 + 0.2 : 0)
          .attr("stroke-linecap", 'round')

      // 3. append additional cirlces on top of the existing ones just for woman CEOs companies 
      // so we can create the stroke effect
      const beeswarmCirclesW = beeswarmG.selectAll(".beeswarm-circle-w")
        .data(currentData.filter(d => d['ceo_woman'] === 'yes'))
        .join("circle")
        .classed("beeswarm-circle-w", true)
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", d => rScale(d['num. of employees'])*0.8)
          .attr("fill", circleWomanColour)
          .attr("opacity", d => d['selected'] === 'yes' ? 1 : 0.1)

      // 4. click events -- use this to control the tooltip later
      beeswarmCircles.on('click', function(e, datum) {
        console.log(datum)
        setSelectedCompnay(datum)
        d3.select(".tooltip")
          .style("top", `${datum.y}px`)
          .style("left", `${datum.x-100}px`)
          .style("opacity", 1)
          .style("z-index", 10)
      })
      beeswarmCirclesW.on('click', function(e, datum) {
        console.log(datum)
        setSelectedCompnay(datum)
        d3.select(".tooltip")
          .style("top", `${datum.y}px`)
          .style("left", `${datum.x-100}px`)
          .style("opacity", 1)
          .style("z-index", 10)
      })

      // 5. Hide the tooltip when clicked outside 
      svg.on("click",function(e, datum){
        if (this == e.target) {
          d3.select(".tooltip")
            .style("opacity", 0)
            .style("z-index", -1)
        }
      });

  

    }
  }, [currentData, selectedSector, selectedCeoFounder, selectedCeoWoman, selectedState])

  return (
    <>
      <div className="beeswarm-container">
        <svg ref={svgRef}></svg>
        {
          selectedCompany
          ?  <div className="tooltip">
                <h4>{selectedCompany.company}</h4>
                <hr></hr>
                <div><span className="tooltip-property">CEO: </span><span>{selectedCompany.CEO}</span></div>
                <div><span className="tooltip-property">Location: </span><span>{selectedCompany.city}, {selectedCompany.state}</span></div>
                <div><span className="tooltip-property">Employees: </span><span>{selectedCompany['num. of employees']}</span></div>
                <div><span className="tooltip-property">Revenue: </span><span>${selectedCompany.revenue}</span></div>
            </div>
          : null
        }
      </div>
    </>
  )
};

export default Beeswarm;