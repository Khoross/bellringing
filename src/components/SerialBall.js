import React, {useState, useEffect} from 'react';
import {timer} from 'rxjs';
import {filter, delay, throttleTime, startWith, switchMap, map, tap} from 'rxjs/operators';

export const SerialBall = ({ws$, sig, dev, wait}) => {
  const [signal, setSignal] = useState(0)
  console.log('TRIGGER')
  useEffect(() => {
    const sig$ = ws$.pipe(
      tap((signal=>console.log(signal))),
      filter((signal) => signal.dev === dev && signal.sig === sig),
      delay(wait),
      throttleTime(100),
      switchMap(() => (
        timer(1000).pipe(
          map(()=>0),
          startWith(1)
          )
        ))
      )
    sig$.subscribe(sig => (console.log(sig),setSignal(sig)))
    return () => sig$.unsubscribe()
  }, [ws$, sig, dev, wait])
  return (
    <svg viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="50" fill={signal === 0 ? "blue" : "red"} />
    </svg>
  )
};