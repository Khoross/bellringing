import React, {useState, useEffect} from 'react';
import {SerialBall} from './SerialBall'
import {timer} from 'rxjs';
import {filter, delay, throttleTime, startWith, switchMap, map} from 'rxjs/operators';

export const SerialConfig = ({ws$, sig, dev}) => {
  const [wait, setWait] = useState(0)
  return (
    <>
      <SerialBall ws$={ws$} sig={sig} dev={dev} wait={wait} />
      <input type='number' onChange={(e)=>setWait(Number(e.target.value))} placeholder="0" step="100"/>
    </>
  )
};