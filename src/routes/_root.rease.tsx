import 'rease/jsx'
import { TypeReaseContext, TypeReaseSubject, subscribe } from 'rease'

import { page } from 'reaserve'

export default function App(
  this: TypeReaseContext,
  {
    $component,
    $isLoading
  } : {
    $component: TypeReaseSubject<Function | null>
    $isLoading: TypeReaseSubject<boolean>
  }
): void {
  console.log(this)
  console.log(page(this))
  
  ;(
    <>
      <a href="/">index</a>
      <a href="/page1">page1</a>
      <a href="/page2">page2</a>
      <a href="/page3?a=12">page3</a>
      <a href="/samples/icons">icons</a>
      <a href="/samples/icons2323">Error</a>
    </>
  )

  ;(
    <r-tag r-is={$component!!} />
  )

  subscribe($component, (cmp) => {
    if (cmp) $isLoading.set(false)
  })
}
