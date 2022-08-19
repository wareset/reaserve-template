import 'rease/jsx'
import { TypeReaseContext } from 'rease'

import { page } from 'reaserve'

import { socketClient } from '#common/sockjs'
console.log(socketClient)

export default function HelloWorld(
  this: TypeReaseContext
): void {
  console.log(this)
  console.log(page(this))

  ;(<h1>
    Hello \u2718 {'\u2718'} {'&amp;'} &amp; World
  </h1>)
}
