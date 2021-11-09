import React, { useState, useEffect } from 'react';
import "./App.css";
import Beeswarm from "./Components/Beeswarm/Beeswarm";
//import Clusters from "./Components/Clusters/Clusters";
import dataLoad from "./data/Fortune_1000.csv";
import * as d3 from 'd3';
import _ from 'lodash';


const unselectedString = 'any'


const BtnAll = ({ setSelectedSector, setSelectedCeoFounder, setSelectedCeoWoman, setSelectedState}) => {

  function selectAllData(e) {
    setSelectedSector(unselectedString)
    setSelectedCeoFounder(unselectedString)
    setSelectedCeoWoman(unselectedString)
    setSelectedState(unselectedString)
  }
  return (
    <>
      <button className="btn-all" onClick={e => selectAllData(e)}>All</button>
    </>
  )
}


const SelectorState = ({ states, setSelectedState }) => {

  function passSelectedState(e) {
    setSelectedState(e.target.value)
  }

  return (
    <>
    <select name="state" id="state-select" onChange={e => passSelectedState(e)}>
      <option value={unselectedString}>State</option>
      <option value={unselectedString}>-- {unselectedString} --</option>
      {
        states
        ? states.map(state => (
          <option key={state} value={state}>{state}</option>
        ))
        : null
      }
    </select>
    </>
  )
}


const SelectorCEOWoman = ({ ceoWoman, setSelectedCeoWoman }) => {

  function passSelectedCeoWoman(e) {
    setSelectedCeoWoman(e.target.value)
  }

  return (
    <>
    <select name="ceo-woman" id="ceo-woman-select" onChange={e => passSelectedCeoWoman(e)}>
      <option value={unselectedString}>Founder is Woman</option>
      <option value={unselectedString}>-- {unselectedString} --</option>
      {
        ceoWoman
        ? ceoWoman.map(ceo => (
          <option key={ceo} value={ceo}>{ceo}</option>
        ))
        : null
      }
    </select>
    </>
  )
}


const SelectorCEOFounder = ({ ceoFounder, setSelectedCeoFounder }) => {

  function passSelectedCeoFounder(e) {
    setSelectedCeoFounder(e.target.value)
  }

  return (
    <>
    <select name="ceo-founder" id="ceo-founder-select" onChange={e => passSelectedCeoFounder(e)}>
      <option value={unselectedString}>Founder is CEO</option>
      <option value={unselectedString}>-- {unselectedString} --</option>
      {
        ceoFounder
        ? ceoFounder.map(ceo => (
          <option key={ceo} value={ceo}>{ceo}</option>
        ))
        : null
      }
    </select>
    </>
  )
}


/// move this to its own component - dropdown menu for the sectors 
const SectorsDropdown = ({ sectors, setSelectedSector }) => {

  // when a sector is selected from the dropdown, pass it into the state setter 
  // for the current sector, which we get as prop from the parent; this way we have access 
  // to the selected sector from the App component and can pass it into the viz 
  function passSelectedSector(e) {
    setSelectedSector(e.target.value)
  }

  return (
    <>
      <select name="sectors" id="sector-select" onChange={e => passSelectedSector(e)}>
          <option value={unselectedString}>Sector</option>
          <option value={unselectedString}>-- {unselectedString} --</option>
          {
            sectors
            ? sectors.map(sector => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))
            : null
          }
      </select>
    </>
  )
}


const App = () => { 

  /// states ///
  const [data, setData] = useState();

  // store the unique values for all the selectors that we use to filter
  const [sectors, setSectors] = useState();
  const [ceoFounder, setCeoFounder] = useState();
  const [ceoWoman, setCeoWoman] = useState();
  const [states, setStates] = useState();
  const [selectedCompany, setSelectedCompnay] = useState(null)

  // set state for the currently selected filter for each selector
  const [selectedSector, setSelectedSector] = useState(unselectedString);
  const [selectedCeoFounder, setSelectedCeoFounder] = useState(unselectedString);
  const [selectedCeoWoman, setSelectedCeoWoman] = useState(unselectedString);
  const [selectedState, setSelectedState] = useState(unselectedString)

  //////////////////////////////////////////////
  ////////////////// data load /////////////////
  //////////////////////////////////////////////
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(company => {
        company.x = NaN
        company.y = NaN
        company.test = 'testing'
      })
      setData(d)
      // get all the unique sectors 
      const sectors = (_.uniqBy(d, 'sector')).map(d => d.sector)
      setSectors(sectors)

      // get all the unique vals for ceo founder 
      const ceoFounder = (_.uniqBy(d, 'ceo_founder')).map(d => d.ceo_founder)
      setCeoFounder(ceoFounder)

      // get all the uniqe vals for ceo woman 
      const ceoWoman = (_.uniqBy(d, 'ceo_woman')).map(d => d.ceo_woman)
      setCeoWoman(ceoWoman)

      // get all the uniqe vals for states
      const states = (_.uniqBy(d, 'state')).map(d => d.state)
      setStates(states)
    })
  }, [])

  return (
    <>
      <h1>Fortune 1000 Companies</h1>

      <div className="selectors-container">
        <BtnAll 
          setSelectedSector={setSelectedSector} 
          setSelectedCeoFounder={setSelectedCeoFounder} 
          setSelectedCeoWoman={setSelectedCeoWoman}
          setSelectedState={setSelectedState}
        />
        <div className="selectors">
          <SectorsDropdown sectors={sectors} setSelectedSector={setSelectedSector}/>
          <SelectorCEOFounder ceoFounder={ceoFounder} setSelectedCeoFounder={setSelectedCeoFounder} />
          <SelectorCEOWoman ceoWoman={ceoWoman} setSelectedCeoWoman={setSelectedCeoWoman} />
          <SelectorState states={states} setSelectedState={setSelectedState} />
        </div>
      </div>

      <Beeswarm 
        data={data} 
        selectedSector={selectedSector} 
        selectedCeoFounder={selectedCeoFounder}
        selectedCeoWoman={selectedCeoWoman}
        selectedState={selectedState}
        selectedCompany={selectedCompany}
        setSelectedCompnay={setSelectedCompnay}
      />

      {/* <Clusters data={data}  /> */}
    </>
  )
};

export default App;