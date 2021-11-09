// import React, { useEffect, useState, useRef } from 'react';
// import * as d3 from 'd3';
// import "./Clusters.css";
// import _ from 'lodash';



// const Clusters = ({ data }) => {

//   const svgRef = useRef();
  
//   const width = 800;
//   const height = 800;
//   const margin = { top: 10, right: 40, bottom: 30, left: 100 }

//   const circleBaseColour = '#2C384E'
//   const circleStrokeColour = '#fff'
//   const circleWomanColour = '#ee6c4d'

//   //////////////////////////////////////////////
//   ///////////////// D3 code ////////////////////
//   //////////////////////////////////////////////
//   useEffect(() => {
//     if (data) {

//       const svg = d3.select(svgRef.current)
//         .attr("width", width)
//         .attr("height", height)

//       function forceCluster() {
//           const strength = 0.2;
//           let nodes;
        
//           function force(alpha) {
//             const centroids = d3.rollup(nodes, centroid, d => d.data.group);
//             const l = alpha * strength;
//             for (const d of nodes) {
//               const {x: cx, y: cy} = centroids.get(d.data.group);
//               d.vx -= (d.x - cx) * l;
//               d.vy -= (d.y - cy) * l;
//             }
//           }
        
//           force.initialize = _ => nodes = _;
        
//           return force;
//         }

//         function forceCollide() {
//           const alpha = 0.4; // fixed for greater rigidity!
//           const padding1 = 2; // separation between same-color nodes
//           const padding2 = 6; // separation between different-color nodes
//           let nodes;
//           let maxRadius;
        
//           function force() {
//             const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
//             for (const d of nodes) {
//               const r = d.r + maxRadius;
//               const nx1 = d.x - r, ny1 = d.y - r;
//               const nx2 = d.x + r, ny2 = d.y + r;
//               quadtree.visit((q, x1, y1, x2, y2) => {
//                 if (!q.length) do {
//                   if (q.data !== d) {
//                     const r = d.r + q.data.r + (d.data.group === q.data.data.group ? padding1 : padding2);
//                     let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
//                     if (l < r) {
//                       l = (l - r) / l * alpha;
//                       d.x -= x *= l, d.y -= y *= l;
//                       q.data.x += x, q.data.y += y;
//                     }
//                   }
//                 } while (q = q.next);
//                 return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
//               });
//             }
//           }
        
//           force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);
        
//           return force;
//         }

//       /// Force definition ///
//       // define force where x is based on the horizonral scale, y pushes the circles to the middle
//       const force = d3.forceSimulation(data)
//         .force("cluster", forceCluster().strength(1))
//         .force('collide', d3.forceCollide(d => 2).strength(1.5))
      
//         // then run the force for a large number of iterations even before appending the shapes 
//         // this way the layout is calculated first and we don't see the giggling in place on load
//         const NUM_ITERATIONS = 400;
//         for (let i = 0; i < NUM_ITERATIONS; ++i) {
//           force.tick();
//         };
//         force.stop();



//       // 1. group for the whole plot
//       const clustersG = svg.selectAll(".clusters-g")
//         .data([null])
//         .join("g")
//         .classed("clusters-g", true)

//       // 2. circles for each company
//       const clustersCircles = clustersG.selectAll(".cluster-circle")
//         .data(data)
//         .join("circle")
//         .classed("cluster-circle", true)
//           .attr("cx", d => d.x)
//           .attr("cy", d => d.y)
//           .attr("r", d => 2)
//           .attr("fill",'maroon')


//     }
//   }, [data])

//   return (
//     <>
//       <div className="clusters-container">
//         <svg ref={svgRef}></svg>
//       </div>
//     </>
//   )
// };

// export default Clusters;